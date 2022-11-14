// Data
const config = require('../data/config.json');
const { template } = require('../data/embeds.json');

// Internal functions
const { isTicket, getUserCreator, updateToOpen, getTicketCategory } = require('../functions/sqlite.js');

// DiscordJs
const { MessageActionRow, MessageButton } = require('discord.js');

// Other Dependencies
const wait = require('node:timers/promises').setTimeout;

exports.run = async (client, message, args) => {
    try {
        const guildId = message.guildId;
        const channelId = message.channelId;

        if(!isTicket(channelId, guildId)) {
            return;
        }

        const embed_reopen = [{
            color: template.reopened.color,
            title: template.reopened.title,
            description: template.reopened.description
        }];

        const btns_ticket_reopen =  new MessageActionRow()
            .addComponents(
                new MessageButton().setCustomId('close').setLabel('Cerrar Ticket').setStyle('DANGER')
            );
        message.reply({ embeds: embed_reopen, components: [ btns_ticket_reopen ] });

        updateToOpen(guildId, channelId);

        await wait(750);

        message.guild.channels.fetch(channelId).then( (channelEdit) => {
            var userCreator = getUserCreator(guildId, channelId);
            var menu_id = getTicketCategory(guildId, channelId);
            var category_info = Object.values(config.guilds[guildId]).flat().find(r => r.id === menu_id);

            var permissions = [
                { id: message.guild.roles.everyone.id, deny: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY' ] },
                { id: config.bot.clientId, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'MANAGE_ROLES' ] },
                { id: userCreator, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES' ] }
            ];

            if(category_info.allowed_staff.length > 0) {
                category_info.allowed_staff.forEach(staff => {
                    permissions.push({ id: staff, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES' ] });
                });
            }

            message.guild.channels.fetch(channelId).edit({
                permissionOverwrites: permissions
            });
            console.log(`[🎫] Ticket Reabierto | Categoria: ${category_info.name} | ID: ${channelEdit.name}`);
        });
    } catch(error) {
        console.error('reOpenTicket::main', error);
    }
}