// Load required resources =================================================================================================
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');
const { color } = require('console-log-colors');

// Load Functions ==========================================================================================================
const {countTotalCategories, countTotalTicketsGlobal, countTotalTicketsOpen, countTotalTicketsClosed, countTotalTicketsDeleted } = require(path.resolve('./functions/sqlite.js'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Monitoreo de estado')
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const totalCategories = await countTotalCategories();
            const totalTicketsGlobal = await countTotalTicketsGlobal();
            const totalTicketsOpen = await countTotalTicketsOpen();
            const totalTicketsClosed = await countTotalTicketsClosed();
            const totalTicketsDeleted = await countTotalTicketsDeleted();

            return interaction.reply({ embeds: [{
                    color: 0x62d1f0,
                    title: '💻 Información del sistema de tickets',
                    description:
                        "```\n"+
                        `🎫 Categorías          ${totalCategories}\n`+
                        `🎫 Tickets Creados     ${totalTicketsGlobal}\n`+
                        `🎫 Tickets Abiertos    ${totalTicketsOpen}\n`+
                        `🎫 Tickets Cerrados    ${totalTicketsClosed}\n`+
                        `🎫 Tickets Eliminados  ${totalTicketsDeleted}\n`+
                        "```",
                    footer: { text: 'Developed by @imkuroneko' }
                }],
                ephemeral: true
            });

            return interaction.reply({ content: '🦄 **eep!** opción de acción no válida', ephemeral: true });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd:info]'), error.message);
        }
    }
};
