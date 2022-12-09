// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { SlashCommandBuilder } = require('discord.js');
const cpuStat = require('cpu-stat');
const path = require('path');
const os = require('os');

// Load custom functions ===================================================================================================
const helpers = require(path.resolve('./functions/helpers.js'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Ver información del bot y el servidor.')
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const djsversion = require('discord.js').version;
            const ping = interaction.client.ws.ping;
            const uptime = interaction.client.uptime;

            cpuStat.usagePercent(function (e, percent, seconds) {
                return interaction.reply({ embeds: [{
                    color: 0x62d1f0,
                    title: '💻 Información del bot y estado del servidor',
                    fields: [
                        { name: '🤖 NodeJS', value: "```"+process.version+"```" },
                        { name: '👾 Discord.JS', value: "```v"+djsversion+"```" },
                        { name: '🏸 API Latency', value: "```"+ping+"ms```" },
                        { name: '⌚ Uptime', value: "```"+helpers.duration(uptime)+"```" },
                        { name: '🧮 Consumo Memoria', value: "```"+(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)+" de "+(os.totalmem() / 1024 / 1024).toFixed(2)+"Mb```" },
                        { name: '🤖 Consumo CPU', value: "```"+percent.toFixed(2)+"%```" },
                        { name: '💻 Sistema Operativo', value: "```"+os.platform()+" ("+os.arch()+")```" },
                    ],
                    footer: { text: 'Developed by KuroNeko#0001' }
                }] });
            });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd::bot]'), error.message);
        }
    }
};