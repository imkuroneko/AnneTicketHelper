// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { Events } = require('discord.js');
const path = require('path');

// Load SQLite Helper ======================================================================================================
const sqlite = require(path.resolve('./functions/sqlite.js'))

// Module script ===========================================================================================================
module.exports = {
    name: Events.ChannelDelete,
    async execute(channel) {
        try {
            const guildId = channel.guildId;
            const channelId = channel.id;

            const validateTicket = await sqlite.isTicket(guildId, channelId);
            if(!validateTicket) { return; }

            sqlite.updateStatus(guildId, channelId, 'deleted');
        } catch(error) {
            console.error(color.red('[event:channelDelete]'), error.message);
        }
    }
};