// Config
const config = require('../data/config.json');

// SQLite
const SQLite = require('better-sqlite3');
const sql = new SQLite('./data/db.sqlite');

// Timezone
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');

module.exports = {
    isTicket: function(channel_id, guild) {
        const query = sql.prepare(" SELECT count(*) as count FROM tickets WHERE channel = ? AND guild = ? ");
        if(query.get(channel_id, guild).count > 0) {
            return true;
        } else {
            return false;
        }
    },

    userTicketsOnCat: function(user, guild, category) {
        const query = sql.prepare(" SELECT count(*) as count FROM tickets WHERE user = ? AND guild = ? AND category = ? AND status = 'A' ");
        return query.get(user, guild, category).count;
    },

    getNewTicketId: function(guild, category) {
        const query = sql.prepare(" SELECT count(*) as count FROM tickets WHERE guild = ? AND category = ? ");
        const num = parseInt(query.get(guild, category).count + 1);
        return num.toString().padStart(5, '0');
    },

    getCurTicketId: function(guild, channel) {
        const query = sql.prepare(" SELECT ticket FROM tickets WHERE guild = ? AND channel = ? ");
        return query.get(guild, channel).ticket.toString().padStart(5, '0');
    },

    getUserCreator: function(guild, channel) {
        const query = sql.prepare(" SELECT user FROM tickets WHERE guild = ? AND channel = ? ");
        return query.get(guild, channel).user.toString();
    },

    getTicketCategory: function(guild, channel) {
        const query = sql.prepare(" SELECT category FROM tickets WHERE guild = ? AND channel = ? ");
        return query.get(guild, channel).category.toString();
    },

    updateToOpen: function(guild, channel) {
        const query = sql.prepare(" UPDATE tickets SET status = 'A' WHERE guild = @gld AND channel = @chn; ");
        query.run({
            gld: guild,
            chn: channel
        });
    },

    updateToClosed: function(guild, channel) {
        const query = sql.prepare(" UPDATE tickets SET status = 'C' WHERE guild = @gld AND channel = @chn; ");
        query.run({
            gld: guild,
            chn: channel
        });
    },

    updateToDeleted: function(guild, channel) {
        dayjs.extend(timezone);
        dayjs.tz.setDefault(config.bot.timezone);
        const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');

        const query = sql.prepare(" UPDATE tickets SET status = 'D', timestamp_deletion = @tms WHERE guild = @gld AND channel = @chn; ");
        query.run({
            gld: guild,
            chn: channel,
            tms: timestamp
        });
    },

    addParticipant: function(guild, channel, user) {
        const query = sql.prepare(" INSERT INTO tickets_external_participants (guild, channel, user) VALUES (@gld, @chn, @usr); ");
        query.run({
            gld: guild,
            chn: channel,
            usr: user
        });
    },

    removeParticipant: function(guild, channel, user) {
        const query = sql.prepare(" DELETE FROM tickets_external_participants WHERE guild = @gld AND channel = @chn AND user = @usr; ");
        query.run({
            gld: guild,
            chn: channel,
            usr: user
        });
    },

    removeUserFromTickets: function(user) {
        const query = sql.prepare(" DELETE FROM tickets_external_participants WHERE user = @usr; ");
        query.run({
            usr: user
        });
    },

    getParticipants: function(guild, channel) {
        const row = sql.prepare("SELECT user FROM tickets_external_participants WHERE channel = ? AND guild = ? ; ");
        return row.all(channel, guild);
    },

    saveNewTicket: function(guild, category, channel, user) {
        dayjs.extend(timezone);
        dayjs.tz.setDefault(config.bot.timezone);
        const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');

        const query = sql.prepare(" INSERT INTO tickets (guild, category, channel, user, timestamp_creation) VALUES (@g, @c, @x, @u, @t); ");
        query.run({ g: guild, c: category, x: channel, u: user, t: timestamp });
    }

};
