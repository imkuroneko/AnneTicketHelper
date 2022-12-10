// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { Events, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const path = require('path');

// Load SQLite Helper ======================================================================================================
const sqlite = require(path.resolve('./functions/sqlite.js'));

// Module script ===========================================================================================================
module.exports = {
    name: 'createTicket',
    async execute(interaction) {        
        try {
            var user = interaction.user.id;
            var guild = interaction.guildId;
            var optionId = interaction.values[0];

            console.log(color.green('[Debug Time UwU] user      :'), user);
            console.log(color.green('[Debug Time UwU] guild     :'), guild);
            console.log(color.green('[Debug Time UwU] optionId  :'), optionId);
        } catch(error) {
            console.error(color.red('[interaction:selectmenu:createticket]'), error.message);
        }
    }
};
