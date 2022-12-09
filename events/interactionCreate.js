// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { Events, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const path = require('path');

// Load SQLite Helper ======================================================================================================
const sqlite = require(path.resolve('./functions/sqlite.js'));

// Module script ===========================================================================================================
module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            const guild = interaction.guildId;
            const channel = interaction.channelId;
            const user = interaction.user.id;

            console.log(color.red('--------------- debug time ---------------'));
            console.log(interaction);

            return;

            if(interaction.isStringSelectMenu()) {
                try {
                    var data = interaction.customId.split(';');
                    var buttonActions = data[0];

                    const btnAction = interaction.client.interactionsSelectMenu.get(buttonActions);
                    if(!btnAction) { return; }

                    await btnAction.execute(interaction);

                } catch(error) {
                    console.error(color.red('event:interactionCreate:select'), error.message);
                    return interaction.reply({ content: 'oops! hubo un error al ejecutar el evento menu 😣', ephemeral: true });
                }
            }

            if(interaction.isChatInputCommand()) {
                try {
                    const command = interaction.client.interactionsSlash.get(interaction.commandName);
                    if(!command) { return; }

                    await command.execute(interaction);
                } catch(error) {
                    console.error(color.red('event:interactionCreate:command'), error.message);
                    return interaction.reply({ content: 'oops! hubo un error al ejecutar el evento menu 😣', ephemeral: true });
                }
            }

            if(interaction.isButton()) {
                try {
                    var data = interaction.customId.split(';');
                    var buttonActions = data[0];

                    const btnAction = interaction.client.interactionsButtons.get(buttonActions);
                    if(!btnAction) { return; }

                    await btnAction.execute(interaction);
                } catch(error) {
                    console.error(color.red('event:interactionCreate:button'), error.message);
                    return interaction.reply({ content: 'oops! hubo un error al ejecutar el evento menu 😣', ephemeral: true });
                }
            }
        } catch(error) {
            console.error(color.red('[event:interactionCreate]'), error.message);
        }
    }
};