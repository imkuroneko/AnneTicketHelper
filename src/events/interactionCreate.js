// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { Events, MessageFlags } = require('discord.js');

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
                    return interaction.reply({ content: 'oops! hubo un error al ejecutar el evento slash 😣', flags: MessageFlags.Ephemeral });
                }
            }

            if(interaction.isModalSubmit()) {
                try {
                    var modalAction = interaction.customId.split(';')[0];

                    const action = interaction.client.interactionsModals.get(modalAction);
                    if(!action) { return; }

                    await action.execute(interaction);
                } catch(error) {
                    console.error(color.red('event:interactionCreate:modal'), error.message);
                    return interaction.reply({ content: 'oops! hubo un error al ejecutar el modal 😣', flags: MessageFlags.Ephemeral });
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
                    return interaction.reply({ content: 'oops! hubo un error al ejecutar el evento button 😣', flags: MessageFlags.Ephemeral });
                }
            }
        } catch(error) {
            console.error(color.red('[event:interactionCreate]'), error.message);
        }
    }
};