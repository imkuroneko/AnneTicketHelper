// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { Routes } = require('discord.js');

// Load configuration files ================================================================================================
const { clientId, ownerId } = require('#config/params.json')

// Module script ===========================================================================================================
exports.run = (client, message, args) => {
    try {
        if(message.author.id != ownerId) { return; }

        if(!message.guild) {
            return message.reply('🦄 Este comando debe usarse dentro de un servidor.');
        }

        const route = Routes.applicationGuildCommands(clientId, message.guild.id);

        client.rest.get(route).then((commands) => {
            const deletions = commands.map((command) => client.rest.delete(`${route}/${command.id}`));

            Promise.all(deletions).then(() => {
                message.reply('🦄 Todos los comandos slash de este servidor fueron eliminados');
            }).catch((error) => {
                message.reply(`\`[🦄 cmdPrefix:slashdeleter]\` ${error.message}`);
                console.error(color.red('[cmdPrefix:slashdeleter]'), error.message);
            });
        }).catch((error) => {
            message.reply(`\`[🦄 cmdPrefix:slashdeleter]\` ${error.message}`);
            console.error(color.red('[cmdPrefix:slashdeleter]'), error.message);
        });
    } catch(error) {
        console.error(color.red('[cmdPrefix:slashdeleter]'), error.message);
    }
}
