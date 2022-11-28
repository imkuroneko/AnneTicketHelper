// Load required resources =================================================================================================
const path = require('path');
const SQLite = require('better-sqlite3');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');

// Load configuration files ================================================================================================
const { serverTimezone } = require(path.resolve('./config/params.json'));

// Database ================================================================================================================
const sql = new SQLite(path.resolve('./data/db.sqlite'));

// Internal Function =======================================================================================================
function getCurrentTimestamp() {
    dayjs.extend(timezone);
    dayjs.tz.setDefault(serverTimezone);
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

    countOpenTicketsByUser: (guildId, categoryId, userId) => {
        try {
            const query = sql.prepare(" SELECT count(*) as count FROM tickets_details WHERE user = ? AND guild = ? AND category = ? AND status = 'A' ");
            return query.get(userId, guildId, categoryId).count;
        } catch(error) {
            console.error('[sqlite] countOpenTicketsByUser', error.message);
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

};
