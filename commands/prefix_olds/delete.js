// Data
const config = require('../config/params.json');
const { template } = require('../data/embeds.json');

// Internal functions
const { isTicket, updateToDeleted, getTicketCategory } = require('../functions/sqlite.js');

// Other Dependencies
const wait = require('node:timers/promises').setTimeout;

exports.run = async (client, message, args) => {
    try {
        const guildId = message.guildId;
        const channelId = message.channelId;

        if(!isTicket(channelId, guildId)) {
            return;
        }

        const sec = config.bot.secDelTicket;

        const embed_delete = [{
            color: template.delete.color,
            title: template.delete.title,
            description: template.delete.description.replaceAll('{seconds}', sec),
        }];
        message.reply({ embeds: embed_delete });

        await wait(sec * 1000);

        const toDelete = message.guild.channels.cache.get(channelId);

        updateToDeleted(toDelete.guildId, toDelete.id);

        var menu_id = getTicketCategory(guildId, channelId);
        var category_info = Object.values(config.guilds[guildId]).flat().find(r => r.id === menu_id);

        console.log(`[🎫] Ticket Eliminado | Categoria: ${category_info.name} ID: ${toDelete.name}`);

        toDelete.delete();
    } catch(error) {
        console.error('deleteTicket::main', error);
    }
}