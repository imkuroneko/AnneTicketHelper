// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { SlashCommandBuilder } = require('discord.js');

// Load SQLite Helper ======================================================================================================
const sqlite = require(path.resolve('./functions/sqlite.js'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('eliminar')
        .setDescription('Eliminar Ticket')
        .setDMPermission(false),
    async execute(interaction) {
        try {
            return interaction.reply({ embeds: [{ color: 0x4f30b3, description: 'Eliminar ticket', }] });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd::eliminar]'), error.message);
        }
    }
};