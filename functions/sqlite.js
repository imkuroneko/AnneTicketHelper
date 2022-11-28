// Load required resources =================================================================================================
const path = require('path');
const SQLite = require('better-sqlite3');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');

// Load configuration files ================================================================================================
const config = require(path.resolve('./data/config.json'));

// Database ================================================================================================================
const sql = new SQLite(path.resolve('./data/db.sqlite'));

// Internal Function =======================================================================================================
function getCurrentTimestamp() {
    dayjs.extend(timezone);
    dayjs.tz.setDefault(config.bot.timezone);
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
}

// Functions Export ========================================================================================================
module.exports = {
    isTicket: (guildId, channelId) => {
        try {
            const query = sql.prepare(" SELECT count(*) as count FROM tickets_details WHERE guild = ? AND channel = ? ");
            return (query.get(guildId, channelId).count > 0);
        } catch(error) {
            console.error('[sqlite] isTicket', error.message);
        }
    },

    openTicketsByUser: (guildId, categoryId, userId) => {
        try {
            const query = sql.prepare(" SELECT count(*) as count FROM tickets_details WHERE user = ? AND guild = ? AND category = ? AND status = 'A' ");
            return query.get(userId, guildId, categoryId).count;
        } catch(error) {
            console.error('[sqlite] openTicketsByUser', error.message);
        }
    },

    generateTicketId: (guildId, categoryId) => {
        try {
            const query = sql.prepare(" SELECT count(*) as count FROM tickets_details WHERE guild = ? AND category = ? ");
            const num = parseInt(query.get(guildId, categoryId).count + 1);
            return num.toString().padStart(5, '0');
        } catch(error) {
            console.error('[sqlite] generateTicketId', error.message);
        }
    },

    createNewTicket: (guildId, categoryId, channelId, userId) => {
        try {
            const query = sql.prepare(" INSERT INTO tickets (guild, category, channel, user, timestamp_creation) VALUES (@g, @c, @x, @u, @t); ");
            query.run({ g: guildId, c: categoryId, x: channelId, u: userId, t: getCurrentTimestamp() });
        } catch(error) {
            console.error('[sqlite] createNewTicket', error.message);
        }
    },

    getDataFromTicket: (guildId, channelId) => {
        try {
            const query = sql.prepare(" SELECT ticket, user, category FROM tickets_details WHERE guild = ? AND channel = ? ");
            const data = query.get(guildId, channelId);
            return [
                ticket = data.ticket.toString().padStart(5, '0'),
                user = data.user.toString(),
                category = data.category.toString()
            ];
        } catch(error) {
            console.error('[sqlite] getDataFromTicket', error.message);
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
    
            const query = sql.prepare(" UPDATE tickets_details SET status = @sts WHERE guild = @gld AND channel = @chn; ");
            query.run({ gld: guildId, chn: channelId, sts: status, tms: timestamp });
        } catch(error) {
            console.error('[sqlite] updateStatus', error.message);
        }
    },

    addParticipant: (guildId, channelId, userId) => {
        try {
            const query = sql.prepare(" INSERT INTO tickets_participants (guild, channel, user) VALUES (@gld, @chn, @usr); ");
            query.run({ gld: guildId, chn: channelId, usr: userId });
        } catch(error) {
            console.error('[sqlite] addParticipant', error.message);
        }
    },

    removeParticipant: (guildId, channelId, userId) => {
        try {
            const query = sql.prepare(" DELETE FROM tickets_participants WHERE guild = @gld AND channel = @chn AND user = @usr; ");
            query.run({ gld: guildId, chn: channelId, usr: userId });
        } catch(error) {
            console.error('[sqlite] removeParticipant', error.message);
        }
    },

    removeUserFromTickets: (userId) => {
        try {
            const query = sql.prepare(" DELETE FROM tickets_participants WHERE user = @usr; ");
            query.run({ usr: userId });
        } catch(error) {
            console.error('[sqlite] removeUserFromTickets', error.message);
        }
    },

    getParticipants: (guildId, channelId) => {
        try {
            const row = sql.prepare("SELECT user FROM tickets_participants WHERE channel = ? AND guild = ? ; ");
            return row.all(channelId, guildId);
        } catch(error) {
            console.error('[sqlite] getParticipants', error.message);
        }
    },

};
