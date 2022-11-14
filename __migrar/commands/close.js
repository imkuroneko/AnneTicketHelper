// Data
const config = require('../data/config.json');
const { template } = require('../data/embeds.json');

// Internal functions
const { isTicket, getUserCreator, updateToClosed, getTicketCategory } = require('../functions/sqlite.js');

// DiscordJs
const { MessageActionRow, MessageButton } = require('discord.js');

exports.run = async (client, message, args) => {
    try {
        const guildId = message.guildId;
        const channelId = message.channelId;

        if(!isTicket(channelId, guildId)) {
            return;
        }

        const embed_closed = [{
            color: template.closed.color,
            title: template.closed.title,
            description: template.closed.description.replaceAll('{prefix_mention}', config.bot.prefix)
        }];

        const btns_ticket_closed =  new MessageActionRow()
            .addComponents(
                new MessageButton().setCustomId('reopen').setLabel('Reabrir Ticket').setStyle('SUCCESS'),
                new MessageButton().setCustomId('delete').setLabel('Eliminar Ticket').setStyle('DANGER')
            );
        message.reply({ embeds: embed_closed, components: [ btns_ticket_closed ] });

        updateToClosed(guildId, channelId);

        message.guild.channels.fetch(channelId).then( (channelEdit) => {
            var userCreator = getUserCreator(guildId, channelId);
            var menu_id = getTicketCategory(guildId, channelId);
            var category_info = Object.values(config.guilds[guildId]).flat().find(r => r.id === menu_id);


            var permissions = [
                { id: message.guild.roles.everyone.id, deny: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY' ] },
                { id: config.bot.clientId, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'MANAGE_ROLES' ] },
                { id: userCreator, deny: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES' ] }
            ];

            if(category_info.allowed_staff.length > 0) {
                category_info.allowed_staff.forEach(staff => {
                    permissions.push({ id: staff, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES' ] });
                });
            }

            channelEdit.edit({
                permissionOverwrites: allowed_staff
            });
            console.log(`[🎫] Ticket Cerrado | Categoria: ${category_info.name} | ID: ${channelEdit.name}`);
        });
    } catch(error) {
        console.error('closeTicket::main', error);
    }
}
