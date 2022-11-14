// Load required resources =================================================================================================
const { SlashCommandBuilder } = require("discord.js");
const path = require('path');

// Load custom functions ===================================================================================================
const sqlite = require(path.resolve('./functions/sanciones'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('removersancion')
        .setDescription('Remover una sanción otorgada a un usuario (de la base de datos)')
        .addStringOption(option => option.setName('uid').setDescription('ID de la sanción').setRequired(true).setMaxLength(12))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const uid = interaction.options.getString('uid');
            const uidClean = uid.replace(/[^a-z0-9]/gi, '');

            await sqlite.removeSanctionById(uidClean);

            return interaction.reply({ content: `Se ha removido la sanción \`${uid}\` exitosamente.`, ephemeral: true  });
        } catch(error) {
            console.error('cmdSlash:removerSancion |', error.message);
        }
    }
};
