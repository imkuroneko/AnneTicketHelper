// Load required resources =================================================================================================
const path = require('path');
const { color } = require('console-log-colors');
const { SlashCommandBuilder } = require('discord.js');

// Load SQLite Helper ======================================================================================================
const sqlite = require(path.resolve('./functions/sqlite.js'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('catdel')
        .setDescription('Eliminar Categoría')
        .addStringOption(option => option.setName('uid').setDescription('ID de la categoría').setRequired(true).setMinLength(8).setMaxLength(8))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const uid = interaction.options.getString('uid');

            var getCategory = await sqlite.readCategory(uid);

            if(typeof getCategory == 'undefined') {
                return interaction.reply({ content: 'No se ha encontrado una categoría con el UID indicado', ephemeral: true });
            }

            var ticketsOnCat = await sqlite.countTicketsOnCategory(uid);
            if(ticketsOnCat > 0) {
                return interaction.reply({ content: 'No se puede eliminar esta categoría porque aún hay tickets (nuevos/abiertos/cerrados)', ephemeral: true });
            }

            await sqlite.deleteCategory(uid);
            return interaction.reply({ content: 'Se ha eliminado la categoría! Recuerda deberás modificar manualmente en los selectores donde lo necesites', ephemeral: true });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd:cateliminar]'), error.message);
        }
    }
};