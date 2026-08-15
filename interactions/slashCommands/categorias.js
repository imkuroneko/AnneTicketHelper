// Load required resources =================================================================================================
const path = require('path');
const { color } = require('console-log-colors');
const { SlashCommandBuilder, ChannelType } = require('discord.js');

// Load Functions ==========================================================================================================
const { hasDiscordEmojis, hasUnicodeEmojis, getFirstDiscordEmoji, getFirstUnicodeEmoji } = require(path.resolve('./functions/helpers.js'));
const { listCategories, createNewCategory, readCategory, updateCategory, readCategory, countTicketsOnCategory, deleteCategory } = require(path.resolve('./functions/sqlite.js'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('categorias')
        .setDescription('Gestionar las categorías de tickets')
        .setDMPermission(false)

        // Comando de listar
        .addSubcommand((subcommand) =>
            subcommand
                .setName('listar')
                .setDescription('Listar categorías existentes')
        )

        // Comando de crear
        .addSubcommand((subcommand) =>
            subcommand
                .setName('crear')
                .setDescription('Crear Categoría')
                .addStringOption(option => option.setName('nombre').setDescription('Nombre de la categoría').setRequired(true).setMinLength(5).setMaxLength(35))
                .addStringOption(option => option.setName('descripcion').setDescription('Descripción de la categoría').setRequired(true).setMinLength(10).setMaxLength(300))
                .addStringOption(option => option.setName('emoji').setDescription('Emoji de la categoría (Utilizar emojis neutrales)').setRequired(true))
                .addChannelOption(option => option.setName('categoria').setDescription('Categoría donde se crearán los tickets').setRequired(true).addChannelTypes(ChannelType.GuildCategory))
                .addIntegerOption(option => option.setName('limite').setDescription('Límite de tickets que puede abrir un usuario en simultáneo en la categoría').setRequired(true))
        )

        // Comando de editar
        .addSubcommand((subcommand) =>
            subcommand
                .setName('editar')
                .setDescription('Editar descripción y límite de la categoría')
                .addStringOption(option => option.setName('uid').setDescription('ID de la categoría').setRequired(true).setMinLength(8).setMaxLength(8))
                .addStringOption(option => option.setName('nombre').setDescription('Nuevo nombre de la categoría').setRequired(true).setMinLength(5).setMaxLength(35))
                .addStringOption(option => option.setName('descripcion').setDescription('Nueva descripción de la categoría').setRequired(true).setMinLength(10).setMaxLength(300))
                .addIntegerOption(option => option.setName('limite').setDescription('Nuevo límite de tickets que puede abrir un usuario en simultáneo en la categoría').setRequired(true))
        )

        // Comando de eliminar
        .addSubcommand((subcommand) =>
            subcommand
                .setName('eliminar')
                .setDescription('Eliminar una categoría de ticket')
                .addStringOption(option => option.setName('uid').setDescription('ID de la categoría').setRequired(true).setMinLength(8).setMaxLength(8))
        ),
    async execute(interaction) {
        try {
            const cmd = interaction.options.getSubcommand();

            // listar categorias
            if(cmd == 'listar') {
                const categorias = await listCategories();

                var fields = [];
                categorias.forEach((cat) => {
                    fields.push({
                        name: `**Categoría:** ${cat.name} (\`${cat.uid}\`)`,
                        value: "```yaml\nLimite tickets abiertos: "+cat.limit_tickets+"\nDescripcion: "+cat.description+"```"
                    });
                });

                return interaction.reply({ embeds: [{ color: 0x4f30b3, title: '🎫 Categorías Disponibles', fields: fields }] });
            }

            // creacion de categorias
            if(cmd == 'crear') {
                const nombre = interaction.options.getString('nombre');
                const descripcion = interaction.options.getString('descripcion');
                const emoji = interaction.options.getString('emoji');
                const categoria = interaction.options.getChannel('categoria');
                const limite = interaction.options.getInteger('limite');

                if(isNaN(limite)) { return interaction.reply({ content: 'El límite debe ser numérico', ephemeral: true }); }
                if(limite == 0)   { return interaction.reply({ content: 'El límite debe ser mayor a cero.', ephemeral: true }); }

                if(hasDiscordEmojis(descripcion) || hasUnicodeEmojis(descripcion)) { return interaction.reply({ content: 'La descripción no puede contener emojis', ephemeral: true }); }

                if(!hasUnicodeEmojis(emoji) && !hasDiscordEmojis(emoji)) { return interaction.reply({ content: 'Por favor escriba un emoji en el campo **emoji**', ephemeral: true }); }

                if(hasDiscordEmojis(emoji)) {
                    if(emoji.startsWith('<a:')) { return interaction.reply({ content: 'No se permiten emojis animados', ephemeral: true }); }

                    emote = getFirstDiscordEmoji(emoji);
                    emojiContent = emoji.replace('<:', '');
                    emojiContent = emojiContent.replace('>', '');
                    emojiContent = emojiContent.split(':');

                    catEmoji = JSON.stringify({ name: emojiContent[0], id: emojiContent[1] });
                } else if(hasUnicodeEmojis(emoji)) {
                    catEmoji = JSON.stringify({ name: getFirstUnicodeEmoji(emoji) });
                } else {
                    catEmoji = JSON.stringify({ name: '🎫' });
                }

                await createNewCategory(nombre, categoria.id, catEmoji, descripcion, limite);

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
            }

            // editar categoria
            if(cmd == 'editar') {
                const uid = interaction.options.getString('uid');
                const nombre = interaction.options.getString('nombre');
                const descripcion = interaction.options.getString('descripcion');
                const limite = interaction.options.getInteger('limite');

                var getCategory = await readCategory(uid);

                if(typeof getCategory == 'undefined') {
                    return interaction.reply({ content: 'No se ha encontrado una categoría con el UID indicado', ephemeral: true });
                }

                if(isNaN(limite)) { return interaction.reply({ content: 'El límite debe ser numérico', ephemeral: true }); }
                if(limite == 0)   { return interaction.reply({ content: 'El límite debe ser mayor a cero.', ephemeral: true }); }
                if(hasDiscordEmojis(descripcion) || hasUnicodeEmojis(descripcion)) { return interaction.reply({ content: 'La descripción no puede contener emojis', ephemeral: true }); }

                await updateCategory(uid, nombre, descripcion, limite);

                return interaction.reply({ content: 'Se ha modificado la categoría! Recuerda deberás modificar manualmente en los selectores donde lo necesites', ephemeral: true });
            }

            // eliminar categoria
            if(cmd == 'eliminar') {
                const uid = interaction.options.getString('uid');

                var getCategory = await readCategory(uid);

                if(typeof getCategory == 'undefined') {
                    return interaction.reply({ content: 'No se ha encontrado una categoría con el UID indicado', ephemeral: true });
                }

                var ticketsOnCat = await countTicketsOnCategory(uid);
                if(ticketsOnCat > 0) {
                    return interaction.reply({ content: 'No se puede eliminar esta categoría porque aún hay tickets (nuevos/abiertos/cerrados)', ephemeral: true });
                }

                await deleteCategory(uid);
                return interaction.reply({ content: 'Se ha eliminado la categoría! Recuerda deberás modificar manualmente en los selectores donde lo necesites', ephemeral: true });
            }

            return interaction.reply({ content: '🦄 **eep!** opción de acción no válida', ephemeral: true });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd:categorias]'), error.message);
        }
    }
};
