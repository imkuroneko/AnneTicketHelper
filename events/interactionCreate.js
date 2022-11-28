// Load required resources =================================================================================================
const { Events, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const path = require('path');

// Load configuration files ================================================================================================
const config = require(path.resolve('./config/params.json'));
const { template, footer } = require(path.resolve('./data/embeds.json'));

// Load SQLite Helper ======================================================================================================
const sqlite = require(path.resolve('./functions/sqlite.js'))

// Module script ===========================================================================================================
module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            const guild = interaction.guildId;
            const channel = interaction.channelId;
            const user = interaction.user.id;

            switch(interaction.componentType) {
                case 'SELECT_MENU':
                    var menu_id = interaction.values[0];

                    var category_info = Object.values(config.guilds[guild]).flat().find(r => r.id === menu_id);
                    const total_open = sqlite.countOpenTicketsByUser(user, guild, menu_id);

                    const embed_content = [{
                        color: template.main_embed.color,
                        title: template.main_embed.title,
                        description: template.main_embed.description
                    }];

                    await interaction.deferUpdate();

                    await wait(750);

                    await interaction.editReply({ embeds: embed_content, ephemeral: true });

                    if(total_open >= category_info.limit) {
                        console.log(`[🎫] Intento fallido de crear ticket | Categoria: ${category_info.name}`);
                        return await interaction.followUp({
                            content: "🎫 No se puede crear el ticket porque has alcanzado el límite de tickets abiertos en esta categoría...",
                            ephemeral: true
                        });
                    }

                    await interaction.followUp({
                        content: "🎫 El ticket está siendo creado...",
                        ephemeral: true
                    });

                    var permissions = [
                        { id: interaction.member.guild.roles.everyone.id, deny: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY' ] },
                        { id: config.bot.clientId, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'MANAGE_ROLES' ] },
                        { id: user, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES' ] }
                    ];

                    if(category_info.allowed_staff.length > 0) {
                        category_info.allowed_staff.forEach(staff => {
                            permissions.push({ id: staff, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES' ] });
                        });
                    }

                    const newTicketId = sqlite.generateTicketId(guild, menu_id);

                    interaction.guild.channels.create(`ticket-${newTicketId}`, {
                        type: 'text',
                        parent: category_info.id,
                        permissionOverwrites: permissions
                    }).then((newChannel) => {
                        sqlite.createNewTicket(guild, category_info.id, newChannel.id, user);

                        interaction.followUp({
                            content: `🎫 Tu ticket se ha creado: <#${newChannel.id}>`,
                            ephemeral: true
                        });

                        const embed_welcome = [{
                            color: template.new.color,
                            title: template.new.title.replaceAll('{catname_mention}', category_info.name),
                            description: template.new.description.replaceAll('{prefix_mention}', config.bot.prefix),
                            footer: footer
                        }];

                        const btns_ticket = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId(`${newChannel.id}-close`).setLabel('Cerrar Ticket').setStyle(ButtonStyle.Danger),
                        );

                        newChannel.send({ content: `Hola <@${user}>!`, embeds: embed_welcome, components: [ btns_ticket ] });

                        console.log(`[🎫] Nuevo Ticket Creado | Categoria: ${category_info.name} | ID: ${newTicketId}`);
                    }).catch((error) => {
                        console.log(error);
                    });
                break;
                /* ============================================================================================================================== */
                case 'BUTTON': // Botones de accion (para gestionar el ticket)
                    const button_id = interaction.customId;

                    const explode = button_id.split('-');
                    const action = explode[1];

                    if(!sqlite.isTicket(channel, guild)) {
                        return;
                    }

                    switch(action) {
                        case 'close':
                            const embed_closed = [{
                                color: template.closed.color,
                                title: template.closed.title,
                                description: template.closed.description.replaceAll('{prefix_mention}', config.bot.prefix)
                            }];

                            const btns_ticket_closed = new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId(`${channel}-reopen`).setLabel('Reabrir Ticket').setStyle(ButtonStyle.Success),
                                new ButtonBuilder().setCustomId(`${channel}-delete`).setLabel('Eliminar Ticket').setStyle(ButtonStyle.Danger),
                            );

                            interaction.reply({ embeds: embed_closed, components: [ btns_ticket_closed ] });

                            sqlite.updateToClosed(guild, channel, 'closed');

                            await wait(750);

                            interaction.guild.channels.fetch(channel).then( (channelEdit) => {
                                var ticketInfo = sqlite.getDataFromTicket(guild, channel);
                                var userCreator = ticketInfo.user;
                                var menu_id = ticketInfo.category;
                                var category_info = Object.values(config.guilds[guild]).flat().find(r => r.id === menu_id);

                                var permissions = [
                                    { id: interaction.member.guild.roles.everyone.id, deny: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY' ] },
                                    { id: config.bot.clientId, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'MANAGE_ROLES' ] },
                                    { id: userCreator, deny: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES' ] }
                                ];

                                if(category_info.allowed_staff.length > 0) {
                                    category_info.allowed_staff.forEach(staff => {
                                        permissions.push({ id: staff, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES' ] });
                                    });
                                }

                                channelEdit.edit({
                                    permissionOverwrites: permissions
                                });


                                console.log(`[🎫] Ticket Cerrado | Categoria: ${category_info.name} | ID: ${channelEdit.name}`);
                            });
                            break;
                        /* ================================================================================================================= */
                        case 'reopen':
                            const embed_reopen = [{
                                color: template.reopened.color,
                                title: template.reopened.title,
                                description: template.reopened.description
                            }];

                            const btns_ticket_reopen = new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId(`${channel.id}-close`).setLabel('Cerrar Ticket').setStyle(ButtonStyle.Danger),
                            );

                            interaction.reply({ embeds: embed_reopen, components: [ btns_ticket_reopen ] });

                            sqlite.updateToOpen(guild, channel, 'open');

                            await wait(750);

                            interaction.guild.channels.fetch(channel).then( (channelEdit) => {
                                var ticketInfo = sqlite.getDataFromTicket(guild, channel);
                                var userCreator = ticketInfo.user;
                                var menu_id = ticketInfo.category;
                                var category_info = Object.values(config.guilds[guild]).flat().find(r => r.id === menu_id);

                                var permissions = [
                                    { id: interaction.member.guild.roles.everyone.id, deny: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY' ] },
                                    { id: config.bot.clientId, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'MANAGE_ROLES' ] },
                                    { id: userCreator, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES' ] }
                                ];

                                if(category_info.allowed_staff.length > 0) {
                                    category_info.allowed_staff.forEach(staff => {
                                        permissions.push({ id: staff, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES' ] });
                                    });
                                }

                                channelEdit.edit({
                                    permissionOverwrites: permissions
                                });

                                console.log(`[🎫] Ticket Reabierto | Categoria: ${category_info.name} | ID: ${channelEdit.name}`);
                            });
                            break;
                        /* ================================================================================================================= */
                        case 'delete':
                            const sec = config.bot.secDelTicket;

                            const embed_delete = [{
                                color: template.delete.color,
                                title: template.delete.title,
                                description: template.delete.description.replaceAll('{seconds}', sec)
                            }];

                            interaction.reply({ embeds: embed_delete });

                            await wait(sec * 1000);

                            const toDelete = interaction.guild.channels.cache.get(channel);

                            sqlite.updateStatus(guild, toDelete.id, 'deleted');

                            toDelete.delete();
                        break;
                    }
                break;
            }
        } catch(error) {
            console.error('event:interactionCreate |', error.message);
        }











        return; // old content

        if(interaction.isChatInputCommand()) {
            try {
                const command = interaction.client.commandsSlash.get(interaction.commandName);
                if(!command) { return; }

                await command.execute(interaction);
            } catch(error) {
                console.error('event:interactionCreate:slash |', error.message);
                return interaction.reply({ content: 'oops! hubo un error al ejecutar el comando 😣', ephemeral: true });
            }
        }

        if(interaction.isButton()) {
            try {
                var data = interaction.customId.split(';');
                var buttonActions = data[0];

                const btnAction = interaction.client.interactions.get(buttonActions);
                if(!btnAction) { return; }

                await btnAction.execute(interaction);
            } catch(error) {
                console.error('event:interactionCreate:button |', error.message);
            }
        }
    }
};