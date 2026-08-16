// Load required resources =================================================================================================
const { Events } = require('discord.js');
const path = require('path');

// Load SQLite Helper ======================================================================================================
const { isTicket, updateStatus } = require('#functions/sqlite.js')

// Module script ===========================================================================================================
module.exports = {
    name: Events.ChannelDelete,
    async execute(channel) {
        try {
            const guildId = channel.guildId;
            const channelId = channel.id;

            const validateTicket = await isTicket(guildId, channelId);
            if(!validateTicket) { return; }

            await updateStatus(guildId, channelId, 'deleted');
        } catch(error) {
            console.error('[event:channelDelete]', error.message);
        }
    }
};