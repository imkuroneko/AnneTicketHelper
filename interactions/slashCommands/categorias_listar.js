// Load required resources =================================================================================================
const path = require('path');
const { color } = require('console-log-colors');
const { SlashCommandBuilder } = require('discord.js');

// Load SQLite Helper ======================================================================================================
const sqlite = require(path.resolve('./functions/sqlite.js'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('catlist')
        .setDescription('Listar todas las categorías disponibles')
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const categorias = await sqlite.listCategories();

            var fields = [];
            categorias.forEach((cat) => {
                fields.push({ name: `**Categoría:** ${cat.name} (\`${cat.uid}\`)`, value: "```yaml\nLimite tickets abiertos: "+cat.limit_tickets+"\nDescripcion: "+cat.description+"```" });
            });

            return interaction.reply({ embeds: [{ color: 0x4f30b3, title: '🎫 Categorías Disponibles', fields: fields }] });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd:catlistar]'), error.message);
        }
    }
};