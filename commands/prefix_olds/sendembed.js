// Data
const config = require('../config/params.json');
const emb = require('../data/embeds.json');

// DiscordJs
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

exports.run = (client, message, args) => {
    try {
        message.delete();
        
        if(message.author.id != config.bot.ownerId) { return; }

        const guild_id = message.guildId;
        var categorias = [];

        for(let index = 0; index < config.guilds[guild_id].length; index++) {
            var data = config.guilds[guild_id][index];

            categorias.push({
                label: data.name,
                description: data.desc,
                value: data.id,
                emoji: data.emoji
            });
        }

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('select')
                .setPlaceholder('Selecciona una categoría')
                .addOptions(categorias),
        );

        const embed_content = [{
            color: emb.template.main_embed.color,
            title: emb.template.main_embed.title,
            description: emb.template.main_embed.description,
            footer: emb.footer
        }];

        message.channel.send({ embeds: embed_content, components: [row] });
        console.log(`[🎫] Envío de embed interactivo`);
    } catch(error) {
        console.error('sendEmbed::main', error);
    }
}