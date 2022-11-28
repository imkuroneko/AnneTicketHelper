// Load required resources =================================================================================================
const { SlashCommandBuilder, ChannelType } = require('discord.js');

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('catnuevo')
        .setDescription('Crear Categoría')
        .addStringOption(option => option.setName('tck_nombre').setDescription('Nombre de la categoría').setRequired(true).setMinLength(10).setMaxLength(35))
        .addStringOption(option => option.setName('tck_descripcion').setDescription('Descripción de la categoría').setRequired(true).setMinLength(10).setMaxLength(40))
        .addStringOption(option => option.setName('tck_emoji').setDescription('Emoji de la categoría').setRequired(true))
        .addChannelOption(option => option.setName('ds_categoria').setDescription('Categoría donde se crearán los tickets').setRequired(true).addChannelTypes(ChannelType.GuildCategory))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const tck_nombre = interaction.options.getString('tck_nombre');
            const tck_descripcion = interaction.options.getString('tck_descripcion');
            const tck_emoji = interaction.options.getString('tck_emoji');
            const ds_categoria = interaction.options.getChannel('ds_categoria');

            console.log('<<<<<<<< tck_nombre', tck_nombre);
            console.log('<<<<<<<< tck_descripcion', tck_descripcion);
            console.log('<<<<<<<< tck_emoji', tck_emoji);
            console.log('<<<<<<<< ds_categoria', ds_categoria);

            return interaction.reply({ embeds: [{ color: 0x4f30b3, description: 'Crear Categoría', }] });
        } catch(error) {
            console.error('cmdSlash:catnuevo |', error.message);
        }
    }
};