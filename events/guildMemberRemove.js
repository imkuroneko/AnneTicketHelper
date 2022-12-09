// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { Events } = require('discord.js');
const path = require('path');

// Load SQLite Helper ======================================================================================================
const sqlite = require(path.resolve('./functions/sqlite.js'))

// Module script ===========================================================================================================
module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        try {

            console.log(member);

            // const userId = member.user.id;
            // sqlite.removeUserFromTickets(userId);
            // agregar para cerrar los tickets del usuario salido

        } catch(error) {
            console.error(color.red('[event:guildMemberRemove]'), error.message);
        }
    }
};