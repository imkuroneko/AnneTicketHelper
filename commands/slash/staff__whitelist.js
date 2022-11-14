// Load required resources =================================================================================================
const { SlashCommandBuilder } = require("discord.js");
const path = require('path');

// Load configuration files ================================================================================================
const config = require(path.resolve('./config/whitelist.json'));

// Load custom functions ===================================================================================================
const sqlite = require(path.resolve('./functions/whitelist'));

// Additional Data =========================================================================================================
const estados = [
    { name: 'Reprobado', value: 'r' },
    { name: 'Aprobado',  value: 'a' }
];

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Publicar el estado del jugador')
        .addStringOption(option => option.setName('estado').setDescription('Estado del examen').setRequired(true).addChoices(...estados))
        .addUserOption(option => option.setName('usuario').setDescription('Selecciona un usuario').setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const estado = interaction.options.getString('estado');
            const user = interaction.options.getUser('usuario');

            if(estado == 'a') {
                embedColor = 0x80c24a;
                embedDesc = `<@${user.id}> ha aprobado el examen! 👋🏻\n**Esperamos disfrutes tu estadía en el servidor.**`;

                if(config.rolToGive.length > 0) {
                    const interact_user = interaction.guild.members.cache.get(user.id);
                    interact_user.roles.add(config.rolToGive);
                }

                sqlite.registerApprovedAttempt(user.id);
            } else {
                embedColor = 0xc23846;
                embedDesc = `<@${user.id}> ha desaprobado el examen! 😞\nNo te desanimes! Podrás intentarlo nuevamente en ${config.hoursBetweenAttempts}hs.`;

                sqlite.registerFailedAttempt(user.id);
            }

            const channel = interaction.guild.channels.cache.get(config.channelAnnouncement);
            channel.send({ embeds: [{
                color: embedColor,
                description: embedDesc,
                footer: { text: `Examen tomado por ${interaction.user.username}`, icon_url: interaction.user.displayAvatarURL() }
            }] });

            return interaction.reply({ content: 'Corrección enviada correctamente', ephemeral: true  });
        } catch(error) {
            console.error('cmdSlash:whitelist |', error.message);
        }
    }
};
