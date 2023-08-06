// Load required resources =================================================================================================
const path = require('path');
const { color } = require('console-log-colors');
const { SlashCommandBuilder, ChannelType } = require('discord.js');

// Load SQLite Helper ======================================================================================================
const helpers = require(path.resolve('./functions/helpers.js'));
const sqlite = require(path.resolve('./functions/sqlite.js'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('catreg')
        .setDescription('Crear Categoría')
        .addStringOption(option => option.setName('nombre').setDescription('Nombre de la categoría').setRequired(true).setMinLength(5).setMaxLength(35))
        .addStringOption(option => option.setName('descripcion').setDescription('Descripción de la categoría').setRequired(true).setMinLength(10).setMaxLength(512))
        .addStringOption(option => option.setName('emoji').setDescription('Emoji de la categoría (Utilizar emojis neutrales)').setRequired(true))
        .addChannelOption(option => option.setName('categoria').setDescription('Categoría donde se crearán los tickets').setRequired(true).addChannelTypes(ChannelType.GuildCategory))
        .addIntegerOption(option => option.setName('limite').setDescription('Límite de tickets que puede abrir un usuario en simultáneo en la categoría').setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const nombre = interaction.options.getString('nombre');
            const descripcion = interaction.options.getString('descripcion');
            const emoji = interaction.options.getString('emoji');
            const categoria = interaction.options.getChannel('categoria');
            const limite = interaction.options.getInteger('limite');

            if(isNaN(limite)) { return interaction.reply({ content: 'El límite debe ser numérico', ephemeral: true }); }
            if(limite == 0)   { return interaction.reply({ content: 'El límite debe ser mayor a cero.', ephemeral: true }); }

            if(helpers.hasDiscordEmojis(descripcion) || helpers.hasUnicodeEmojis(descripcion)) { return interaction.reply({ content: 'La descripción no puede contener emojis', ephemeral: true }); }

            if(!helpers.hasUnicodeEmojis(emoji) && !helpers.hasDiscordEmojis(emoji)) { return interaction.reply({ content: 'Por favor escriba un emoji en el campo **emoji**', ephemeral: true }); }

            if(helpers.hasDiscordEmojis(emoji)) {
                if(emoji.startsWith('<a:')) { return interaction.reply({ content: 'No se permiten emojis animados', ephemeral: true }); }

                emote = helpers.getFirstDiscordEmoji(emoji);
                emojiContent = emoji.replace('<:', '');
                emojiContent = emojiContent.replace('>', '');
                emojiContent = emojiContent.split(':');

                catEmoji = JSON.stringify({ name: emojiContent[0], id: emojiContent[1] });
            } else if(helpers.hasUnicodeEmojis(emoji)) {
                catEmoji = JSON.stringify({ name: helpers.getFirstUnicodeEmoji(emoji) });
            } else {
                catEmoji = JSON.stringify({ name: '🎫' });
            }

            await sqlite.createNewCategory(nombre, categoria.id, catEmoji, descripcion, limite);

            return interaction.reply({
                embeds: [{
                        color: 0x4f30b3,
                        title: 'Nueva categoría creada',
                        fields: [
                            { name: 'Nombre', value: nombre, inline: true },
                            { name: 'Emoji', value: emoji, inline: true },
                            { name: 'Limite Tickets', value: limite, inline: true },
                            { name: 'Descripción', value: descripcion, inline: false },
                            { name: 'Categoria', value: categoria.name+' ('+categoria.id+')', inline: false },
                        ]
                }],
                ephemeral: true
            });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd:catnuevo]'), error.message);
        }
    }
};
