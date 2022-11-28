// Load required resources =================================================================================================
const { SlashCommandBuilder } = require('discord.js');

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('cateliminar')
        .setDescription('Eliminar Categoría')
        .addStringOption(option => option.setName('tck_id').setDescription('ID de la categoría a eliminar').setRequired(true).setMinLength(8).setMaxLength(8))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const tck_id = interaction.options.getString('tck_id');

            console.log('<<<<<<<< tck_id', tck_id);

            return interaction.reply({ embeds: [{ color: 0x4f30b3, description: 'Eliminar Categoría', }] });
        } catch(error) {
            console.error('cmdSlash:cateliminar |', error.message);
        }
    }
};