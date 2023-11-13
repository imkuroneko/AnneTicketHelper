// Load required resources =================================================================================================
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');
const { color } = require('console-log-colors');
const cpuStat = require('cpu-stat');
const os = require('os');

// Load Functions ==========================================================================================================
const sqlite = require(path.resolve('./functions/sqlite.js'));
const helpers = require(path.resolve('./functions/helpers.js'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Monitoreo de estado')
        .setDMPermission(false)
        .addSubcommand((subcommand) => subcommand.setName('host').setDescription('servidor'))
        .addSubcommand((subcommand) => subcommand.setName('tickets').setDescription('sistema de tickets')),
    async execute(interaction) {
        try {
            const cmd = interaction.options.getSubcommand();

            if(cmd == 'host') {
                const djsversion = require('discord.js').version;
                const ping = interaction.client.ws.ping;
                `🟢 NodeJS              ${process.version}\n`+
                `🟣 DiscordJS           v${djsversion}\n`+
                `⌚ API Latency         ${ping}ms\n\n`+

                cpuStat.usagePercent(function (e, percent, seconds) {
                    return interaction.reply({ embeds: [{
                        color: 0x62d1f0,
                        title: '💻 Información del VPS y bot',
                        description:
                            "```\n"+
                            `💻 S.O.        : ${os.platform()} (${os.arch()})\n`+
                            `⌚ Uptime      : ${helpers.duration(os.uptime())}\n`+
                            `🧮 Memoria     : ${((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(2)}Mb / ${(os.totalmem() / 1024 / 1024).toFixed(2)}Mb\n`+
                            `🤖 CPU         : ${percent.toFixed(2)}%\n\n`+
                            `🟢 NodeJS      : ${process.version}\n`+
                            `🟣 DiscordJS   : v${djsversion}\n`+
                            `⌚ API Latency : ${ping}ms\n`+
                            "```",
                        footer: { text: 'Developed by @imkuroneko' }
                    }] });
                });    
            }

            if(cmd == 'tickets') {
                const totalCategories = await sqlite.countTotalCategories();
                const totalTicketsGlobal = await sqlite.countTotalTicketsGlobal();
                const totalTicketsOpen = await sqlite.countTotalTicketsOpen();
                const totalTicketsClosed = await sqlite.countTotalTicketsClosed();
                const totalTicketsDeleted = await sqlite.countTotalTicketsDeleted();

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
            }

            return interaction.reply({ content: '🦄 **eep!** opción de acción no válida', ephemeral: true });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd:info]'), error.message);
        }
    }
};
