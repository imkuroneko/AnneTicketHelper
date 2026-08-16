// Load required resources =================================================================================================
const { ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags, OverwriteType } = require('discord.js');
const path = require('path');

// Load configuration files ================================================================================================
const { clientId, staffRole } = require('#config/params.json');
const { template } = require('#data/embeds.json');

// Load SQLite Helper ======================================================================================================
const { isTicket, getDataFromTicket, updateStatus } = require('#functions/sqlite.js');

// Module script ===========================================================================================================
module.exports = {
    name: 'reopenTicket',
    async execute(interaction) {
        try {
            const guildId  = interaction.guildId;
            const optionId = (interaction.customId).replace('reopenTicket;', '');

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
                color: parseInt(template.reopened.color, 16),
                title: template.reopened.title,
                description: template.reopened.description
            }];

            const btns_ticket = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`closeTicket;${optionId}`).setLabel('Cerrar Ticket').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId(`deleteTicket;${optionId}`).setLabel('Eliminar Ticket').setStyle(ButtonStyle.Danger),
            );

            interaction.reply({ embeds: embed, components: [ btns_ticket ] });

            await updateStatus(guildId, optionId, 'open');

            interaction.guild.channels.fetch(optionId).then( (channelEdit) => {
                var channelPermissions = [
                    { id: interaction.member.guild.roles.everyone.id, type: OverwriteType.Role, deny: [ 'ViewChannel', 'ReadMessageHistory' ] },
                    { id: clientId, type: OverwriteType.Member, allow: [ 'ViewChannel', 'ReadMessageHistory', 'SendMessages', 'ManageChannels', 'ManageMessages', 'ManageRoles' ] },
                    { id: ticketInfo.user, type: OverwriteType.Member, allow: [ 'ViewChannel', 'ReadMessageHistory', 'SendMessages' ] },
                ];

                if(typeof staffRole != 'undefined' && staffRole.length > 0 ) {
                    channelPermissions.push({ id: staffRole, type: OverwriteType.Role, allow: [ 'ViewChannel', 'ReadMessageHistory', 'SendMessages' ] });
                }

                channelEdit.edit({ permissionOverwrites: channelPermissions });
            });
        } catch(error) {
            console.error('[interaction:buttons:reopenticket]', error);
        }
    }
};
