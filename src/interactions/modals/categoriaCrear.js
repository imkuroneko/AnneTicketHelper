// Load required resources =================================================================================================
const { ChannelType, MessageFlags } = require('discord.js');

// Load Functions ==========================================================================================================
const { hasDiscordEmojis, hasUnicodeEmojis, getFirstDiscordEmoji, getFirstUnicodeEmoji } = require('#functions/helpers.js');
const { createNewCategory } = require('#functions/sqlite.js');

// Module script ===========================================================================================================
module.exports = {
    name: 'categoriaCrear',
    async execute(interaction) {
        try {
            const nombre = interaction.fields.getTextInputValue('nombre');
            const descripcion = interaction.fields.getTextInputValue('descripcion');
            const emoji = interaction.fields.getTextInputValue('emoji');
            const limiteRaw = interaction.fields.getTextInputValue('limite');
            const categoria = interaction.fields.getSelectedChannels('categoria', true, [ChannelType.GuildCategory]).first();

            const limite = parseInt(limiteRaw, 10);

            if(isNaN(limite)) { return interaction.reply({ content: 'El límite debe ser numérico', flags: MessageFlags.Ephemeral }); }
            if(limite <= 0)   { return interaction.reply({ content: 'El límite debe ser mayor a cero.', flags: MessageFlags.Ephemeral }); }

            if(hasDiscordEmojis(descripcion) || hasUnicodeEmojis(descripcion)) { return interaction.reply({ content: 'La descripción no puede contener emojis', flags: MessageFlags.Ephemeral }); }

            if(!hasUnicodeEmojis(emoji) && !hasDiscordEmojis(emoji)) { return interaction.reply({ content: 'Por favor escriba un emoji en el campo **emoji**', flags: MessageFlags.Ephemeral }); }

            var catEmoji;
            if(hasDiscordEmojis(emoji)) {
                const emote = getFirstDiscordEmoji(emoji);
                if(emote.startsWith('<a:')) { return interaction.reply({ content: 'No se permiten emojis animados', flags: MessageFlags.Ephemeral }); }

                const emojiContent = emote.replace('<:', '').replace('>', '').split(':');
                catEmoji = JSON.stringify({ name: emojiContent[0], id: emojiContent[1] });
            } else {
                catEmoji = JSON.stringify({ name: getFirstUnicodeEmoji(emoji) });
            }

            createNewCategory(interaction.guildId, nombre, categoria.id, catEmoji, descripcion, limite);

            return interaction.reply({
                embeds: [{
                        color: 0x4f30b3,
                        title: 'Nueva categoría creada',
                        fields: [
                            { name: 'Nombre', value: nombre, inline: true },
                            { name: 'Emoji', value: emoji, inline: true },
                            { name: 'Limite Tickets', value: limite.toString(), inline: true },
                            { name: 'Descripción', value: descripcion, inline: false },
                            { name: 'Categoria', value: `${categoria.name} (${categoria.id})`, inline: false },
                        ]
                }],
                flags: MessageFlags.Ephemeral
            });
        } catch(error) {
            console.error('[interaction:modals:categoriacrear]', error.message);
        }
    }
};
