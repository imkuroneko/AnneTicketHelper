// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { SlashCommandBuilder, ChannelType } = require('discord.js');

// Load SQLite Helper ======================================================================================================
const sqlite = require(path.resolve('./functions/sqlite.js'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('catmodificar')
        .setDescription('Modificar Categoría')
        .addStringOption(option => option.setName('tck_id').setDescription('ID de la categoría a editar').setRequired(true).setMinLength(8).setMaxLength(8))
        .addStringOption(option => option.setName('tck_nombre').setDescription('Nuevo nombre de la categoría').setMinLength(10).setMaxLength(35))
        .addStringOption(option => option.setName('tck_descripcion').setDescription('Nueva descripción de la categoría').setMinLength(10).setMaxLength(40))
        .addStringOption(option => option.setName('tck_emoji').setDescription('Nuevo emoji de la categoría'))
        .addChannelOption(option => option.setName('ds_categoria').setDescription('Nuevo categoría donde se crearán los tickets').addChannelTypes(ChannelType.GuildCategory))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const tck_id = interaction.options.getString('tck_id');
            const tck_nombre = interaction.options.getString('tck_nombre');
            const tck_descripcion = interaction.options.getString('tck_descripcion');
            const tck_emoji = interaction.options.getString('tck_emoji');
            const ds_categoria = interaction.options.getChannel('ds_categoria');

            console.log('<<<<<<<< tck_id', tck_id);
            console.log('<<<<<<<< tck_nombre', tck_nombre);
            console.log('<<<<<<<< tck_descripcion', tck_descripcion);
            console.log('<<<<<<<< tck_emoji', tck_emoji);
            console.log('<<<<<<<< ds_categoria', ds_categoria);

            return interaction.reply({ embeds: [{ color: 0x4f30b3, description: 'Modificar Categoría', }] });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd::catmodificar]'), error.message);
        }
    }
};