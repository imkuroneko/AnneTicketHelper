// Data
const config = require('../data/config.json');
const { template, footer } = require('../data/embeds.json');

// Custom functions 💜
const {
    openTicketsByUser,
    generateTicketId,
    saveNewTicket,
    isTicket,
    updateToDeleted,
    updateToClosed,
    updateToOpen,
    getUserCreator,
    getTicketCategory
} = require('../functions/sqlite.js');

// DiscordJs
const { MessageActionRow, MessageButton } = require('discord.js');

// Other Dependencies
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    name: 'interactionCreate',
    async execute(int) {
        try {
            // 📘 Datos Necesarios
            const guild = int.guildId;
            const channel = int.channelId;
            const user = int.user.id;

            switch(int.componentType) {
                case 'SELECT_MENU':
                    var menu_id = int.values[0];

                    var category_info = Object.values(config.guilds[guild]).flat().find(r => r.id === menu_id);
                    const total_open = openTicketsByUser(user, guild, menu_id);

                    const embed_content = [{
                        color: template.main_embed.color,
                        title: template.main_embed.title,
                        description: template.main_embed.description
                    }];

                    await int.deferUpdate();

                    await wait(750);

                    await int.editReply({ embeds: embed_content, ephemeral: true });

                    if(total_open >= category_info.limit) {
                        console.log(`[🎫] Intento fallido de crear ticket | Categoria: ${category_info.name}`);
                        return await int.followUp({
                            content: "🎫 No se puede crear el ticket porque has alcanzado el límite de tickets abiertos en esta categoría...",
                            ephemeral: true
                        });
                    }

                    await int.followUp({
                        content: "🎫 El ticket está siendo creado...",
                        ephemeral: true
                    });

                    var permissions = [
                        { id: int.member.guild.roles.everyone.id, deny: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY' ] },
                        { id: config.bot.clientId, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'MANAGE_ROLES' ] },
                        { id: user, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES' ] }
                    ];

                    if(category_info.allowed_staff.length > 0) {
                        category_info.allowed_staff.forEach(staff => {
                            permissions.push({ id: staff, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES' ] });
                        });
                    }

                    const newTicketId = generateTicketId(guild, menu_id);

                    int.guild.channels.create(`ticket-${newTicketId}`, {
                        type: 'text',
                        parent: category_info.id,
                        permissionOverwrites: permissions
                    }).then((newChannel) => {
                        saveNewTicket(guild, category_info.id, newChannel.id, user);

                        int.followUp({
                            content: `🎫 Tu ticket se ha creado: <#${newChannel.id}>`,
                            ephemeral: true
                        });

                        const embed_welcome = [{
                            color: template.new.color,
                            title: template.new.title.replaceAll('{catname_mention}', category_info.name),
                            description: template.new.description.replaceAll('{prefix_mention}', config.bot.prefix),
                            footer: footer
                        }];

                        const btns_ticket = new MessageActionRow().addComponents( new MessageButton().setCustomId(`${newChannel.id}-close`).setLabel('Cerrar Ticket').setStyle('DANGER') );

                        newChannel.send({ content: `Hola <@${user}>!`, embeds: embed_welcome, components: [ btns_ticket ] });

                        console.log(`[🎫] Nuevo Ticket Creado | Categoria: ${category_info.name} | ID: ${newTicketId}`);
                    }).catch((error) => {
                        console.log(error);
                    });
                break;
                /* ============================================================================================================================== */
                case 'BUTTON': // Botones de accion (para gestionar el ticket)
                    const button_id = int.customId;

                    const explode = button_id.split('-');
                    const action = explode[1];

                    if(!isTicket(channel, guild)) {
                        return;
                    }

                    switch(action) {
                        case 'close':
                            const embed_closed = [{
                                color: template.closed.color,
                                title: template.closed.title,
                                description: template.closed.description.replaceAll('{prefix_mention}', config.bot.prefix)
                            }];

                            const btns_ticket_closed =  new MessageActionRow()
                                .addComponents(
                                    new MessageButton().setCustomId(`${channel}-reopen`).setLabel('Reabrir Ticket').setStyle('SUCCESS'),
                                    new MessageButton().setCustomId(`${channel}-delete`).setLabel('Eliminar Ticket').setStyle('DANGER')
                                );
                            int.reply({ embeds: embed_closed, components: [ btns_ticket_closed ] });

                            updateToClosed(guild, channel);

                            await wait(750);

                            int.guild.channels.fetch(channel).then( (channelEdit) => {
                                var userCreator = getUserCreator(guild, channel);
                                var menu_id = getTicketCategory(guild, channel);
                                var category_info = Object.values(config.guilds[guild]).flat().find(r => r.id === menu_id);

                                var permissions = [
                                    { id: int.member.guild.roles.everyone.id, deny: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY' ] },
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

                            const btns_ticket_reopen =  new MessageActionRow()
                                .addComponents(
                                    new MessageButton().setCustomId(`${channel}-close`).setLabel('Cerrar Ticket').setStyle('DANGER')
                                );
                            int.reply({ embeds: embed_reopen, components: [ btns_ticket_reopen ] });

                            updateToOpen(guild, channel);

                            await wait(750);

                            int.guild.channels.fetch(channel).then( (channelEdit) => {
                                var userCreator = getUserCreator(guild, channel);
                                var menu_id = getTicketCategory(guild, channel);
                                var category_info = Object.values(config.guilds[guild]).flat().find(r => r.id === menu_id);

                                var permissions = [
                                    { id: int.member.guild.roles.everyone.id, deny: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY' ] },
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

                            int.reply({ embeds: embed_delete });

                            await wait(sec * 1000);

                            const toDelete = int.guild.channels.cache.get(channel);

                            updateToDeleted(guild, toDelete.id);

                            toDelete.delete();
                        break;
                    }
                break;
            }

        } catch (error) {
            console.error('interactionCreate', error);
        }
    }
};
