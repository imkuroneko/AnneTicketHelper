// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { SlashCommandBuilder } = require('discord.js');

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('reabrir')
        .setDescription('Reabrir Ticket')
        .setDMPermission(false),
    async execute(interaction) {
        try {
            return interaction.reply({ embeds: [{ color: 0x4f30b3, description: 'Reabrir ticket', }] });
        } catch(error) {
            console.error(color.red('[cmdSlash:reabrir]'), error.message);
        }
    }
};