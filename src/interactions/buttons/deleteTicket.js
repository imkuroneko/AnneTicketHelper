// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { MessageFlags } = require('discord.js');
const path = require('path');
const wait = require('node:timers/promises').setTimeout;

// Load configuration files ================================================================================================
const { secDelTicket } = require('#config/params.json');
const { template } = require('#data/embeds.json');

// Load SQLite Helper ======================================================================================================
const { isTicket, getDataFromTicket, updateStatus } = require('#functions/sqlite.js');

// Module script ===========================================================================================================
module.exports = {
    name: 'deleteTicket',
    async execute(interaction) {
        try {
            const guildId  = interaction.guildId;
            const optionId = (interaction.customId).replace('deleteTicket;', '');

            const validateTicket = await isTicket(guildId, optionId);
            if(!validateTicket) {
                return interaction.reply({ content: 'Este canal no es un ticket', flags: MessageFlags.Ephemeral });
            }

            const ticketInfo = await getDataFromTicket(guildId, optionId);
            if(typeof ticketInfo == 'undefined') {
                return interaction.reply({
                    content: 'No se pudo obtener detalles del ticket porque no se encuentra registrado',
                    flags: MessageFlags.Ephemeral
                });
            }

            const embed = [{
                color: parseInt(template.delete.color, 16),
                title: template.delete.title,
                description: template.delete.description.replaceAll('{seconds}', secDelTicket)
            }];

            interaction.reply({ embeds: embed });

            await wait(secDelTicket * 1000);

            await updateStatus(guildId, optionId, 'deleted');

            const channelDel = await interaction.guild.channels.cache.get(optionId);
            channelDel.delete();
        } catch(error) {
            console.error(color.red('[interaction:buttons:deleteticket]'), error);
        }
    }
};
