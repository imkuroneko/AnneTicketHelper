// Load required resources =================================================================================================
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
                title: '🎫 AnneTicketHelper 🌸',
                description: 'Sistema de tickets multicategorías para Discord.\n**Desarrollado por:** [@KuroNeko](https://github.com/imkuroneko)',
            }] });
        } catch(error) {
            console.error('[interaction:slashcmd:acercade]', error.message);
        }
    }
};