// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

// Load custom functions ===================================================================================================
const helpers = require(path.resolve('./functions/helpers.js'));
const sqlite = require(path.resolve('./functions/sqlite.js'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Ver información del bot.')
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const djsversion = require('discord.js').version;
            const ping = interaction.client.ws.ping;


            const totalCategories = await sqlite.countTotalCategories();
            const totalTicketsGlobal = await sqlite.countTotalTicketsGlobal();
            const totalTicketsOpen = await sqlite.countTotalTicketsOpen();
            const totalTicketsClosed = await sqlite.countTotalTicketsClosed();
            const totalTicketsDeleted = await sqlite.countTotalTicketsDeleted();

            return interaction.reply({ embeds: [{
                color: 0x62d1f0,
                title: '💻 Información del bot y del sistema de tickets',
                description:
                    "```\n"+
                    `🟢 NodeJS              ${process.version}\n`+
                    `🟣 DiscordJS           v${djsversion}\n`+
                    `⌚ API Latency         ${ping}ms\n\n`+
                    `🎫 Categorías          ${totalCategories}\n`+
                    `🎫 Tickets Creados     ${totalTicketsGlobal}\n`+
                    `🎫 Tickets Abiertos    ${totalTicketsOpen}\n`+
                    `🎫 Tickets Cerrados    ${totalTicketsClosed}\n`+
                    `🎫 Tickets Eliminados  ${totalTicketsDeleted}\n`+
                    "```",
                footer: { text: 'Developed by KuroNeko#0001' }
            }], ephemeral: true });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd:bot]'), error.message);
        }
    }
};