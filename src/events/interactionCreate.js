// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { Events } = require('discord.js');

// Module script ===========================================================================================================
module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            if(interaction.isChatInputCommand()) {
                try {
                    const command = interaction.client.interactionsSlash.get(interaction.commandName);
                    if(!command) { return; }

                    await command.execute(interaction);
                } catch(error) {
                    console.error(color.red('event:interactionCreate:command'), error.message);
                    return interaction.reply({ content: 'oops! hubo un error al ejecutar el evento slash 😣', ephemeral: true });
                }
            }

            if(interaction.isStringSelectMenu()) {
                try {
                    var optionId = interaction.values[0];
                    var interactionName = optionId.split(';');
                    
                    const menuAction = interaction.client.interactionsSelectMenu.get(interactionName[0]);
                    if(!menuAction) { return; }

                    await menuAction.execute(interaction);
                } catch(error) {
                    console.error(color.red('event:interactionCreate:select'), error.message);
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
                    return interaction.reply({ content: 'oops! hubo un error al ejecutar el evento button 😣', ephemeral: true });
                }
            }
        } catch(error) {
            console.error(color.red('[event:interactionCreate]'), error.message);
        }
    }
};