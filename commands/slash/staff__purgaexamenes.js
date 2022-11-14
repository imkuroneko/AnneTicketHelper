// Load required resources =================================================================================================
const { SlashCommandBuilder } = require("discord.js");
const path = require('path');

// Load custom functions ===================================================================================================
const sqlite = require(path.resolve('./functions/whitelist'));

// Additional Data =========================================================================================================
const estados = [
    { name: 'Reprobados', value: 'r' },
    { name: 'Aprobados',  value: 'a' },
    { name: 'Todos',      value: 'x' },
];

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('purgaexamenes')
        .setDescription('Borrar intentos aprobados/reprobados del jugador de la base de datos')
        .addStringOption(option => option.setName('estado').setDescription('Estado del examen').setRequired(true).addChoices(...estados))
        .addUserOption(option => option.setName('usuario').setDescription('Selecciona un usuario').setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const estado = interaction.options.getString('estado');
            const user = interaction.options.getUser('usuario');

            switch(estado) {
                // ===== Intentos aprobados
                case 'a':
                    await sqlite.purgeApprovedAttempts(user.id);
                break;
                // ===== Intentos reprobados
                case 'r':
                    await sqlite.purgeFailedAttempts(user.id);
                break;
                // ===== Todos los intentos
                default:
                    await sqlite.purgeApprovedAttempts(user.id);
                    await sqlite.purgeFailedAttempts(user.id);
                break;
            }

            return interaction.reply({ content: 'Correcciones borradas correctamente de la base de datos', ephemeral: true  });
        } catch(error) {
            console.error('cmdSlash:whitelist |', error.message);
        }
    }
};
