// Load required resources =================================================================================================
const path = require('path');
const { color } = require('console-log-colors');
const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

// Load configuration files ================================================================================================
const { clientId, staffRole } = require(path.resolve('./config/params.json'));
const { template } = require(path.resolve('./data/embeds.json'));

// Load Functions ==========================================================================================================
const sqlite = require(path.resolve('./functions/sqlite.js'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('tickets')
        .setDescription('Gestionar un ticket')
        .setDMPermission(false)

        // Comando de reabrir
        .addSubcommand((subcommand) => subcommand.setName('reabrir').setDescription('Reabrir el ticket cerrado'))

        // Comando de cerrar
        .addSubcommand((subcommand) => subcommand.setName('cerrar').setDescription('Cerrar el ticket abierto'))

        // Comando de eliminar
        .addSubcommand((subcommand) => subcommand.setName('eliminar').setDescription('Eliminar el ticket')),
    async execute(interaction) {
        try {
            const guildId  = interaction.guildId;
            const optionId = interaction.channelId;

            const cmd = interaction.options.getSubcommand();

            if(cmd == 'reabrir') {
                const validateTicket = await sqlite.isTicket(guildId, optionId);
                if(!validateTicket) {
                    return interaction.reply({ content: 'Este canal no es un ticket', ephemeral: true });
                }

                const ticketInfo = await sqlite.getDataFromTicket(guildId, optionId);
                if(typeof ticketInfo == 'undefined') {
                    return interaction.reply({ content: 'No se pudo obtener detalles del ticket porque no se encuentra registrado', ephemeral: true });
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

                await sqlite.updateStatus(guildId, optionId, 'open');

                interaction.guild.channels.fetch(optionId).then( (channelEdit) => {
                    var channelPermissions = [
                        { id: interaction.member.guild.roles.everyone.id, deny: [ 'ViewChannel', 'ReadMessageHistory' ] },
                        { id: clientId, allow: [ 'ViewChannel', 'ReadMessageHistory', 'SendMessages', 'ManageChannels', 'ManageMessages', 'ManageRoles' ] },
                        { id: ticketInfo.user, allow: [ 'ViewChannel', 'ReadMessageHistory', 'SendMessages' ] },
                    ];

                    if(typeof staffRole != 'undefined' && staffRole.length > 0 ) {
                        channelPermissions.push({ id: staffRole, allow: [ 'ViewChannel', 'ReadMessageHistory', 'SendMessages' ] });
                    }

                    channelEdit.edit({ permissionOverwrites: channelPermissions });
                });
            }

            if(cmd == 'cerrar') {
                const validateTicket = await sqlite.isTicket(guildId, optionId);
                if(!validateTicket) {
                    return interaction.reply({ content: 'Este canal no es un ticket', ephemeral: true });
                }

                const ticketInfo = await sqlite.getDataFromTicket(guildId, optionId);
                if(typeof ticketInfo == 'undefined') {
                    return interaction.reply({
                        content: 'No se pudo obtener detalles del ticket porque no se encuentra registrado',
                        ephemeral: true
                    });
                }

                const embed = [{
                    color: parseInt(template.closed.color, 16),
                    title: template.closed.title,
                    description: template.closed.description
                }];

                const btns_ticket = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`reopenTicket;${optionId}`).setLabel('Reabrir Ticket').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`deleteTicket;${optionId}`).setLabel('Eliminar Ticket').setStyle(ButtonStyle.Danger),
                );

                interaction.reply({ embeds: embed, components: [ btns_ticket ] });

                await sqlite.updateStatus(guildId, optionId, 'closed');

                interaction.guild.channels.fetch(optionId).then( (channelEdit) => {
                    var channelPermissions = [
                        { id: interaction.member.guild.roles.everyone.id, deny: [ 'ViewChannel', 'ReadMessageHistory' ] },
                        { id: clientId, allow: [ 'ViewChannel', 'ReadMessageHistory', 'SendMessages', 'ManageChannels', 'ManageMessages', 'ManageRoles' ] },
                        { id: ticketInfo.user, deny: [ 'ViewChannel', 'ReadMessageHistory', 'SendMessages' ] },
                    ];

                    if(typeof staffRole != 'undefined' && staffRole.length > 0 ) {
                        channelPermissions.push({ id: staffRole, allow: [ 'ViewChannel', 'ReadMessageHistory', 'SendMessages' ] });
                    }

                    channelEdit.edit({ permissionOverwrites: channelPermissions });
                });    
            }

            if(cmd == 'eliminar') {
                const validateTicket = await sqlite.isTicket(guildId, optionId);
                if(!validateTicket) {
                    return interaction.reply({ content: 'Este canal no es un ticket!', ephemeral: true });
                }

                const ticketInfo = await sqlite.getDataFromTicket(guildId, optionId);
                if(typeof ticketInfo == 'undefined') {
                    return interaction.reply({
                        content: 'No se pudo obtener detalles del ticket porque no se encuentra registrado',
                        ephemeral: true
                    });
                }

                const embed = [{
                    color: parseInt(template.delete.color, 16),
                    title: template.delete.title,
                    description: template.delete.description.replaceAll('{seconds}', secDelTicket)
                }];

                interaction.reply({ embeds: embed });

                await wait(secDelTicket * 1000);

                await sqlite.updateStatus(guildId, optionId, 'deleted');

                const channelDel = await interaction.guild.channels.cache.get(optionId);
                channelDel.delete();
            }

            return interaction.reply({ content: '🦄 **eep!** opción de acción no válida', ephemeral: true });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd:tickets]'), error.message);
        }
    }
};
