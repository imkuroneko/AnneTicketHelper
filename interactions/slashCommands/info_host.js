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
        .setName('host')
        .setDescription('Ver estado del servidor.')
        .setDMPermission(false),
    async execute(interaction) {
        try {
            cpuStat.usagePercent(function (e, percent, seconds) {
                return interaction.reply({ embeds: [{
                    color: 0x62d1f0,
                    title: '💻 Información del VPS',
                    fields: [
                        { inline: false, name: '💻 S.O.', value: "```"+os.platform()+" ("+os.arch()+")```" },
                        { inline: true, name: '⌚ Uptime', value: "```"+helpers.duration(os.uptime())+"```" },
                        { inline: true, name: '🧮 Memoria', value: "```"+((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(2)+" de "+(os.totalmem() / 1024 / 1024).toFixed(2)+"Mb```" },
                        { inline: true, name: '🤖 CPU', value: "```"+percent.toFixed(2)+"%```" },
                    ],
                    footer: { text: 'Developed by KuroNeko#0001' }
                }] });
            });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd:host]'), error.message);
        }
    }
};