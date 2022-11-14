// Load required resources =================================================================================================
const { SlashCommandBuilder } = require("discord.js");
const path = require('path');

// Load custom functions ===================================================================================================
const sqlite = require(path.resolve('./functions/sanciones'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('removersanciones')
        .setDescription('Remover las sanción otorgadas a un usuario (de la base de datos)')
        .addUserOption(option => option.setName('usuario').setDescription('Selecciona un usuario').setRequired(true))
        .addStringOption(option => option.setName('uid').setDescription('ID de la sanción').setRequired(true).setMaxLength(12))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const usuario = interaction.options.getUser('usuario');

            await sqlite.removeSanctionsByUserId(usuario.id);

            return interaction.reply({ content: `Se han removido las sanciones del usuario exitosamente.`, ephemeral: true  });
        } catch(error) {
            console.error('cmdSlash:removerSancion |', error.message);
        }
    }
};
