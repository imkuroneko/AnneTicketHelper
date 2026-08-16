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

        client.rest.put(Routes.applicationGuildCommands(clientId, message.guild.id), { body: client.slashRegister }).then(() => {
            message.reply('🦄 Todos los comandos fueron registrados/actualizados en este servidor!');
        }).catch((error) => {
            message.reply(`\`[🦄 cmdPrefix:slashregister]\` ${error.message}`);
            console.error(color.red('[cmdPrefix:slashregister]'), error.message);
        });
    } catch(error) {
        console.error(color.red('[cmdPrefix:slashregister]'), error.message);
    }
}