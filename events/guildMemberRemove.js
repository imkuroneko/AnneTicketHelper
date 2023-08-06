// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { Events } = require('discord.js');
const path = require('path');

// Load configuration files ================================================================================================
const { deleteTicketOnLeft } = require(path.resolve('./config/params.json'));

// Load SQLite Helper ======================================================================================================
const sqlite = require(path.resolve('./functions/sqlite.js'))

// Module script ===========================================================================================================
module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        try {
            const userId = member.user.id;
            const guildId = member.guild.id;

            if(deleteTicketOnLeft) {
                const channelsToClose = await sqlite.getTicketsMemberLeft(guildId, userId);
                channelsToClose.forEach(async (ticket) => {
                    const channelDel = await member.guild.channels.cache.get(ticket.channel);
                    channelDel.delete();
                });
            }
        } catch(error) {
            console.error(color.red('[event:guildMemberRemove]'), error.message);
        }
    }
};