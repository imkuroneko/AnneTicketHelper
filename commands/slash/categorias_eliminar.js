// Load required resources =================================================================================================
const { SlashCommandBuilder } = require('discord.js');

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('cateliminar')
        .setDescription('Eliminar Categoría')
        .setDMPermission(false),
    async execute(interaction) {
        try {
            return interaction.reply({ embeds: [{ color: 0x4f30b3, description: 'Eliminar Categoría', }] });
        } catch(error) {
            console.error('cmdSlash:cateliminar |', error.message);
        }
    }
};