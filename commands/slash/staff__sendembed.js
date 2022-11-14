// Load required resources =================================================================================================
const { SlashCommandBuilder } = require("discord.js");
const path = require('path');

// Load configuration files ================================================================================================
const { ownerId } = require(path.resolve('./config/bot.json'))

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendembed')
        .setDescription('Enviar un embed en este canal. (Puedes crear el formato utilizando eb.nadeko.bot )')
        .addStringOption(option => option.setName('embed').setDescription('El embed a enviar').setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const embed = interaction.options.getString('embed');

            if(interaction.user.id != ownerId) {
                return interaction.reply({ content: '❌ No tienes permiso para utilizar este comando...', ephemeral: true });
            }

            if(!embed) {
                return interaction.reply({ content: '🚨 embed no válido', ephemeral: true });
            }

            if(!(isJsonString(embed))) {
                return interaction.reply({ content: 'este embed no tiene un formato válido.', ephemeral: true });
            }

            const channel = interaction.client.channels.cache.find(channel => channel.id == interaction.channelId);
            channel.send(JSON.parse(embed));

            return interaction.reply({ content: '🦄 listo!', ephemeral: true });

            function isJsonString(str) {
                try {
                    JSON.parse(str);
                } catch(e) {
                    return false;
                }
                return true;
            }
        } catch(error) {
            console.error('cmdSlash:sendembed |', error.message);
        }
    }
};