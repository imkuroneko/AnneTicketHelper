// Load required resources =================================================================================================
const path = require('path');
const { color } = require('console-log-colors');
const { SlashCommandBuilder, ChannelType } = require('discord.js');

// Load SQLite Helper ======================================================================================================
const sqlite = require(path.resolve('./functions/sqlite.js'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('catmodificar')
        .setDescription('Modificar descripción y límite de la categoría')
        .addStringOption(option => option.setName('uid').setDescription('ID de la categoría').setRequired(true).setMinLength(8).setMaxLength(8))
        .addStringOption(option => option.setName('nombre').setDescription('Nuevo nombre de la categoría').setRequired(true).setMinLength(5).setMaxLength(35))
        .addStringOption(option => option.setName('descripcion').setDescription('Nueva descripción de la categoría').setRequired(true).setMinLength(10).setMaxLength(512))
        .addIntegerOption(option => option.setName('limite').setDescription('Nuevo límite de tickets que puede abrir un usuario en simultáneo en la categoría').setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const uid = interaction.options.getString('uid');
            const nombre = interaction.options.getString('nombre');
            const descripcion = interaction.options.getString('descripcion');
            const limite = interaction.options.getInteger('limite');

            var getCategory = await sqlite.readCategory(uid);

            if(typeof getCategory == 'undefined') {
                return interaction.reply({ content: 'No se ha encontrado una categoría con el ID indicado', ephemeral: true });
            }

            if(isNaN(limite)) { return interaction.reply({ content: 'El límite debe ser numérico', ephemeral: true }); }
            if(limite == 0)   { return interaction.reply({ content: 'El límite debe ser mayor a cero.', ephemeral: true }); }

            sqlite.updateCategory(uid, nombre, descripcion, limite);

            return interaction.reply({ content: 'Se ha modificado la categoría! Recuerda deberás modificar manualmente en los selectores donde lo necesites', ephemeral: true });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd:catmodificar]'), error.message);
        }
    }
};