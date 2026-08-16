// Load required resources =================================================================================================
const SQLite = require('better-sqlite3');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const { color } = require('console-log-colors');

// Load configuration files ================================================================================================
const { serverTimezone } = require('#config/params.json');

// Load custom functions ===================================================================================================
const { uid } = require('./helpers.js');

// Database ================================================================================================================
const sql = new SQLite(require.resolve('#data/db.sqlite'));

sql.pragma('journal_mode = WAL');
sql.pragma('synchronous = NORMAL');
sql.pragma('foreign_keys = ON');

// Schema bootstrap =========================================================================================================
sql.exec(`
    CREATE TABLE IF NOT EXISTS tickets_categories (
        "uid"           TEXT NOT NULL,
        "guild"         TEXT NOT NULL,
        "name"          TEXT NOT NULL,
        "category"      TEXT NOT NULL,
        "emoji"         TEXT NOT NULL,
        "description"   TEXT NOT NULL,
        "limit_tickets" INTEGER NOT NULL,
        PRIMARY KEY("uid")
    );

    CREATE TABLE IF NOT EXISTS tickets_details (
        "ticket"             INTEGER NOT NULL,
        "guild"              TEXT NOT NULL,
        "category"           TEXT NOT NULL,
        "channel"            TEXT NOT NULL,
        "user"               TEXT NOT NULL,
        "status"             TEXT NOT NULL DEFAULT 'A',
        "timestamp_creation" TEXT NOT NULL,
        "timestamp_deletion" TEXT
    );

    CREATE TABLE IF NOT EXISTS tickets_counters (
        "guild"       TEXT NOT NULL,
        "category"    TEXT NOT NULL,
        "next_number" INTEGER NOT NULL,
        PRIMARY KEY("guild", "category")
    );

    CREATE TABLE IF NOT EXISTS tickets_menus (
        "uid"                TEXT NOT NULL,
        "guild"               TEXT NOT NULL,
        "categories"          TEXT NOT NULL,
        "timestamp_creation"  TEXT NOT NULL,
        PRIMARY KEY("uid")
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_details_guild_category_ticket ON tickets_details("guild", "category", "ticket");
    CREATE INDEX IF NOT EXISTS idx_tickets_details_guild_channel ON tickets_details("guild", "channel");
    CREATE INDEX IF NOT EXISTS idx_tickets_details_guild_user_category_status ON tickets_details("guild", "user", "category", "status");
    CREATE INDEX IF NOT EXISTS idx_tickets_details_category_status ON tickets_details("category", "status");
    CREATE INDEX IF NOT EXISTS idx_tickets_details_status ON tickets_details("status");
    CREATE INDEX IF NOT EXISTS idx_tickets_menus_guild ON tickets_menus("guild");
`);

// Schema migrations (columnas agregadas después de la versión original de la tabla) =======================================
// ALTER TABLE ADD COLUMN no soporta IF NOT EXISTS en esta versión de SQLite, así que se chequea manualmente.
const ticketsDetailsColumns = sql.prepare('PRAGMA table_info(tickets_details)').all().map((c) => c.name);
if(!ticketsDetailsColumns.includes('subject'))     { sql.exec('ALTER TABLE tickets_details ADD COLUMN "subject" TEXT'); }
if(!ticketsDetailsColumns.includes('description')) { sql.exec('ALTER TABLE tickets_details ADD COLUMN "description" TEXT'); }

// "guild" nullable acá porque SQLite no permite agregar una columna NOT NULL sin default; en tablas ya existentes las
// categorías viejas (creadas antes de esta migración) van a quedar con guild NULL y no aparecerán en /menu ni /categorias
// hasta recrearlas — no hay forma de inferir a qué guild pertenecían.
const ticketsCategoriesColumns = sql.prepare('PRAGMA table_info(tickets_categories)').all().map((c) => c.name);
if(!ticketsCategoriesColumns.includes('guild')) { sql.exec('ALTER TABLE tickets_categories ADD COLUMN "guild" TEXT'); }

// El índice de "guild" en tickets_categories se crea recién acá (no en el bootstrap de arriba) porque en una base ya
// existente la columna no existe todavía en ese punto — se agrega justo antes, en la línea de ALTER TABLE de arriba.
sql.exec('CREATE INDEX IF NOT EXISTS idx_tickets_categories_guild ON tickets_categories("guild")');

// Prepared statements (prepared once at module load, reused on every call) ================================================
const stmt = {
    isTicket: sql.prepare(" SELECT count(*) as count FROM tickets_details WHERE guild = ? AND channel = ? "),
    countOpenTicketsByUser: sql.prepare(" SELECT count(*) as count FROM tickets_details WHERE user = ? AND guild = ? AND category = ? AND status = 'A' "),

    // Atomically reserves the next ticket number for a (guild, category) pair. On first use for that pair it seeds the
    // counter from the historical count in tickets_details, then increments on every following call in a single
    // statement — no read-then-write gap, so two concurrent ticket creations can never collide on the same number.
    nextTicketNumber: sql.prepare(`
        INSERT INTO tickets_counters (guild, category, next_number)
        VALUES (@g, @c, (SELECT COUNT(*) FROM tickets_details WHERE guild = @g AND category = @c) + 1)
        ON CONFLICT(guild, category) DO UPDATE SET next_number = next_number + 1
        RETURNING next_number
    `),

    createNewTicket: sql.prepare(" INSERT INTO tickets_details (ticket, guild, category, channel, user, subject, description, timestamp_creation) VALUES (@i, @g, @c, @x, @u, @sub, @desc, @t); "),
    getDataFromTicket: sql.prepare(" SELECT ticket, user, category, subject, description FROM tickets_details WHERE guild = ? AND channel = ? "),
    updateStatus: sql.prepare(" UPDATE tickets_details SET status = @sts, timestamp_deletion = @tms WHERE guild = @gld AND channel = @chn; "),
    getTicketsMemberLeft: sql.prepare(" SELECT category, channel FROM tickets_details WHERE guild = @gld AND user = @usr AND status != 'D'; "),

    listCategoriesByGuild: sql.prepare(" SELECT * FROM tickets_categories WHERE guild = ? "),
    categoryUidExists: sql.prepare(" SELECT count(*) as count FROM tickets_categories WHERE uid = ? "),
    menuUidExists: sql.prepare(" SELECT count(*) as count FROM tickets_menus WHERE uid = ? "),
    createMenu: sql.prepare(" INSERT INTO tickets_menus (uid, guild, categories, timestamp_creation) VALUES (@u, @g, @c, @t); "),
    getMenuCategories: sql.prepare(" SELECT categories FROM tickets_menus WHERE uid = ? "),
    createNewCategory: sql.prepare(" INSERT INTO tickets_categories (uid, guild, name, category, emoji, description, limit_tickets) VALUES (@u, @g, @n, @c, @e, @d, @l); "),
    readCategory: sql.prepare(" SELECT * FROM tickets_categories WHERE uid = ? "),
    updateCategory: sql.prepare(" UPDATE tickets_categories SET name = @n, description = @d, limit_tickets = @l WHERE uid = @u; "),
    deleteCategory: sql.prepare(" DELETE FROM tickets_categories WHERE uid = @uid; "),
    countTicketsOnCategory: sql.prepare(" SELECT count(*) as count FROM tickets_details WHERE category = ? AND status != 'D' "),

    // Stats
    countTotalCategories: sql.prepare(" SELECT count(*) as count FROM tickets_categories "),
    countTotalTicketsGlobal: sql.prepare(" SELECT count(*) as count FROM tickets_details "),
    countTotalTicketsOpen: sql.prepare(" SELECT count(*) as count FROM tickets_details WHERE status = 'A' "),
    countTotalTicketsClosed: sql.prepare(" SELECT count(*) as count FROM tickets_details WHERE status = 'C' "),
    countTotalTicketsDeleted: sql.prepare(" SELECT count(*) as count FROM tickets_details WHERE status = 'D' "),
};

// Internal Function =======================================================================================================
function getCurrentTimestamp() {
    dayjs.extend(timezone);
    dayjs.tz.setDefault(serverTimezone);
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
}

function genCatUID() {
    var newUID = uid(8);
    if(stmt.categoryUidExists.get(newUID).count == 0) { return newUID; } else { return genCatUID(); }
}

function genMenuUID() {
    var newUID = uid(8);
    if(stmt.menuUidExists.get(newUID).count == 0) { return newUID; } else { return genMenuUID(); }
}

// Graceful shutdown ========================================================================================================
function closeDatabase() {
    try { sql.close(); } catch(error) { console.error(color.red('[sqlite:close]'), error.message); }
}
process.once('SIGINT', closeDatabase);
process.once('SIGTERM', closeDatabase);

// Functions Export ========================================================================================================
module.exports = {
    isTicket: (guildId, channelId) => {
        try {
            return (stmt.isTicket.get(guildId, channelId).count > 0);
        } catch(error) {
            console.error(color.red('[sqlite:isTicket]'), error.message);
        }
    },

    countOpenTicketsByUser: (guildId, categoryId, userId) => {
        try {
            return stmt.countOpenTicketsByUser.get(userId, guildId, categoryId).count;
        } catch(error) {
            console.error(color.red('[sqlite:countOpenTicketsByUser]'), error.message);
        }
    },

    generateTicketId: (guildId, categoryId) => {
        try {
            const row = stmt.nextTicketNumber.get({ g: guildId, c: categoryId });
            return row.next_number.toString().padStart(5, '0');
        } catch(error) {
            console.error(color.red('[sqlite:generateTicketId]'), error.message);
        }
    },

    createNewTicket: (ticket, guildId, categoryId, channelId, userId, subject, description) => {
        try {
            stmt.createNewTicket.run({ i: ticket, g: guildId, c: categoryId, x: channelId, u: userId, sub: subject, desc: description, t: getCurrentTimestamp() });
        } catch(error) {
            console.error(color.red('[sqlite:createNewTicket]'), error.message);
        }
    },

    getDataFromTicket: (guildId, channelId) => {
        try {
            const data = stmt.getDataFromTicket.get(guildId, channelId);
            if(typeof data == 'undefined') { return undefined; }
            return {
                ticket: data.ticket,
                user: data.user.toString(),
                category: data.category.toString(),
                subject: data.subject,
                description: data.description
            };
        } catch(error) {
            console.error(color.red('[sqlite:getDataFromTicket]'), error.message);
        }
    },

    updateStatus: (guildId, channelId, newStatus) => {
        try {
            switch(newStatus) {
                default:
                case 'open':    var status = 'A'; var timestamp = null; break;
                case 'closed':  var status = 'C'; var timestamp = null; break;
                case 'deleted': var status = 'D'; var timestamp = getCurrentTimestamp(); break;
            }

            stmt.updateStatus.run({ gld: guildId, chn: channelId, sts: status, tms: timestamp });
        } catch(error) {
            console.error(color.red('[sqlite:updateStatus]'), error.message);
        }
    },

    getTicketsMemberLeft: (guildId, userId) => {
        try {
            return stmt.getTicketsMemberLeft.all({ gld: guildId, usr: userId });
        } catch(error) {
            console.error(color.red('[sqlite:getTicketsMemberLeft]'), error.message);
        }
    },

    listCategoriesByGuild: (guildId) => {
        try {
            return stmt.listCategoriesByGuild.all(guildId);
        } catch(error) {
            console.error(color.red('[sqlite:listCategoriesByGuild]'), error.message);
        }
    },

    createNewCategory: (guildId, name, category, emoji, description, limit) => {
        try {
            stmt.createNewCategory.run({ u: genCatUID(), g: guildId, n: name, c: category, e: emoji, d: description, l: limit });
        } catch(error) {
            console.error(color.red('[sqlite:createNewCategory]'), error.message);
        }
    },

    readCategory: (uid) => {
        try {
            return stmt.readCategory.get(uid);
        } catch(error) {
            console.error(color.red('[sqlite:readCategory]'), error.message);
        }
    },

    updateCategory: (uid, name, description, limit) => {
        try {
            stmt.updateCategory.run({ n: name, d: description, l: limit, u: uid });
        } catch(error) {
            console.error(color.red('[sqlite:updateCategory]'), error.message);
        }
    },

    deleteCategory: (uid) => {
        try {
            stmt.deleteCategory.run({ uid: uid });
        } catch(error) {
            console.error(color.red('[sqlite:deleteCategory]'), error.message);
        }
    },

    // Guarda qué categorías forman parte de un menú (mensaje con el botón "Abrir Ticket") ya publicado, para que el
    // botón solo necesite llevar un UID corto en su customId en vez de la lista completa (que puede superar el
    // límite de 100 caracteres que tiene Discord para customId si se eligen muchas categorías).
    createMenu: (guildId, categoryUids) => {
        try {
            const menuUid = genMenuUID();
            stmt.createMenu.run({ u: menuUid, g: guildId, c: JSON.stringify(categoryUids), t: getCurrentTimestamp() });
            return menuUid;
        } catch(error) {
            console.error(color.red('[sqlite:createMenu]'), error.message);
        }
    },

    getMenuCategories: (menuUid) => {
        try {
            const row = stmt.getMenuCategories.get(menuUid);
            if(typeof row == 'undefined') { return undefined; }
            return JSON.parse(row.categories);
        } catch(error) {
            console.error(color.red('[sqlite:getMenuCategories]'), error.message);
        }
    },

    countTicketsOnCategory: (categoryChannelId) => {
        try {
            return stmt.countTicketsOnCategory.get(categoryChannelId).count;
        } catch(error) {
            console.error(color.red('[sqlite:countTicketsOnCategory]'), error.message);
        }
    },

    // Stats
    countTotalCategories: () => {
        try {
            return stmt.countTotalCategories.get().count;
        } catch(error) {
            console.error(color.red('[sqlite:countTotalCategories]'), error.message);
        }
    },

    countTotalTicketsGlobal: () => {
        try {
            return stmt.countTotalTicketsGlobal.get().count;
        } catch(error) {
            console.error(color.red('[sqlite:countTotalTicketsGlobal]'), error.message);
        }
    },

    countTotalTicketsOpen: () => {
        try {
            return stmt.countTotalTicketsOpen.get().count;
        } catch(error) {
            console.error(color.red('[sqlite:countTotalTicketsOpen]'), error.message);
        }
    },

    countTotalTicketsClosed: () => {
        try {
            return stmt.countTotalTicketsClosed.get().count;
        } catch(error) {
            console.error(color.red('[sqlite:countTotalTicketsClosed]'), error.message);
        }
    },

    countTotalTicketsDeleted: () => {
        try {
            return stmt.countTotalTicketsDeleted.get().count;
        } catch(error) {
            console.error(color.red('[sqlite:countTotalTicketsDeleted]'), error.message);
        }
    },
};