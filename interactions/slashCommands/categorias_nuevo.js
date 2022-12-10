// Load required resources =================================================================================================
const path = require('path');
const { color } = require('console-log-colors');
const { SlashCommandBuilder, ChannelType } = require('discord.js');

// Load SQLite Helper ======================================================================================================
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


            sqlite.createNewCategory(nombre, categoria.id, emoji, descripcion, limite);

            const content = `
                Se ha creado exitosamente la nueva categoría! Recuerda deberás agregarlo manualmente en los selectores donde lo necesites.

                **Nombre de la categoría:**
                \`\`\`${nombre}\`\`\`
                **Descripción:**
                \`\`\`${descripcion}\`\`\`
                **Emoji:**
                \`\`\`${emoji}\`\`\`
                **Categoría:**
                \`\`\`${categoria.name}\`\`\`
            `;

            return interaction.reply({ embeds: [{ color: 0x4f30b3, description: content, }], ephemeral: true });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd:catnuevo]'), error.message);
        }
    }
};