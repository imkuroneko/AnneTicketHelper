// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { MessageFlags } = require('discord.js');

// Load SQLite Helper ======================================================================================================
const { readCategory, countTicketsOnCategory, deleteCategory } = require('#functions/sqlite.js');

// Module script ===========================================================================================================
module.exports = {
    name: 'categoriaEliminar',
    async execute(interaction) {
        try {
            const uid = interaction.fields.getStringSelectValues('categoria')[0];

            const getCategory = readCategory(uid);
            if(typeof getCategory == 'undefined' || getCategory.guild !== interaction.guildId) {
                return interaction.reply({ content: 'No se ha encontrado una categoría con el UID indicado', flags: MessageFlags.Ephemeral });
            }

            const ticketsOnCat = countTicketsOnCategory(getCategory.category);
            if(ticketsOnCat > 0) {
                return interaction.reply({ content: 'No se puede eliminar esta categoría porque aún hay tickets (nuevos/abiertos/cerrados)', flags: MessageFlags.Ephemeral });
            }

            deleteCategory(uid);
            return interaction.reply({ content: `Se ha eliminado la categoría **${getCategory.name}**! Recuerda deberás modificar manualmente en los selectores donde lo necesites`, flags: MessageFlags.Ephemeral });
        } catch(error) {
            console.error(color.red('[interaction:modals:categoriaeliminar]'), error.message);
        }
    }
};
