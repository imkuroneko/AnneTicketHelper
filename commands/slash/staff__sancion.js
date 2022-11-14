// Load required resources =================================================================================================
const { SlashCommandBuilder } = require("discord.js");
const path = require('path');

// Load configuration files ================================================================================================
const { rolToGive } = require(path.resolve('./config/whitelist.json'));
const config = require(path.resolve('./config/sanciones.json'));

// Load custom functions ===================================================================================================
const sqlite = require(path.resolve('./functions/sanciones'));

// Additional Data =========================================================================================================
var niveles = [];
config.categories.forEach((nivel) => {
    niveles.push({ name: nivel.name, value: nivel.id });
});

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('sancion')
        .setDescription('Sancionar a un jugador')
        .addUserOption(option => option.setName('usuario').setDescription('Selecciona un usuario').setRequired(true))
        .addStringOption(option => option.setName('nivel').setDescription('Nivel de la sanción').setRequired(true).addChoices(...niveles))
        .addStringOption(option => option.setName('motivo').setDescription('El motivo de la sanción').setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            // Datos recibidos
            const usuario = interaction.options.getUser('usuario');
            const nivel = interaction.options.getString('nivel');
            const motivo = interaction.options.getString('motivo');

            // Parámetros según el nivel de sanción
            const nivelSancionData = Object.values(config.categories).flat().find(r => r.id === nivel);

            // Variables
            var additionalMsg = '';

            // Datos utilitarios
            const uid = sqlite.registerSanction(usuario.id, nivelSancionData.points, motivo);

            // Envio del embed
            const channel = interaction.guild.channels.cache.get(config.channelAnnouncement);
            channel.send({ embeds: [{
                color: parseInt(nivelSancionData.color, 16),
                title: "**Usuario sancionado**",
                fields: [
                    { name : '**Usuario**', value: `${usuario.username} (<@${usuario.id}>)` },
                    { name : '**Motivo**', value: motivo },
                    { name : '**Gravedad**', value: nivelSancionData.name },
                ],
                footer: { text: `Sanción realizada por ${interaction.user.username} | SancionId: ${uid}`, icon_url: interaction.user.displayAvatarURL() }
            }] });

            // Verificación para remover rol de whitelist
            const userPoints = sqlite.countPointsSanctions(usuario.id);
            if(userPoints >= config.maxPoints) {
                try {
                    const interact_user = interaction.guild.members.cache.get(interaction.user.id);
                    interact_user.roles.remove(rolToGive);
                    additionalMsg = '; Se ha retirado al usuario el rol de Whitelist por llegar al límite de puntos de sanción';
                } catch(error) {
                    console.error('cmdSlash:sancion:removeRole |', error.message);
                }
            }

            // Verificación para banear usuario
            if(nivelSancionData.ban) {
                interaction.guild.members.ban(usuario).catch((error) => {
                    console.error('cmdSlash:sancion:ban |', error.message);
                });
            }

            return interaction.reply({ content: `Sanción registrada correctamente ${additionalMsg}`, ephemeral: true });
        } catch(error) {
            console.error('cmdSlash:sancion |', error.message);
        }
    }
};
