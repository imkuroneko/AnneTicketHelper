// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { SlashCommandBuilder } = require('discord.js');

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('acercade')
        .setDescription('Acerca del proyecto')
        .setDMPermission(false),
    async execute(interaction) {
        try {
            return interaction.reply({ embeds: [{
                color: 0x4f30b3,
                title: '🎫 AyamiTicketHelper 🌸',
                description: 'Sistema de tickets multicategorías para Discord.\n**Desarrollado por:** [@KuroNeko](https://github.com/imkuroneko)',
                footer: { text: 'De by KuroNeko#0001' }
            }] });
        } catch(error) {
            console.error(color.red('[cmdSlash:acercade]'), error.message);
        }
    }
};