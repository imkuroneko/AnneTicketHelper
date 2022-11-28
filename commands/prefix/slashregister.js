// Load required resources =================================================================================================
const path = require('path');
const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

// Load configuration files ================================================================================================
const { clientId, ownerId, token } = require(path.resolve('./config/bot.json'))

// Module script ===========================================================================================================
exports.run = (client, message, args) => {
    try {
        if(message.author.id != ownerId) { return; }

        const rest = new REST({ version: '10' }).setToken(token);

        rest.put(Routes.applicationCommands(clientId), { body: client.slashRegister }).then(() => {
            message.reply('🦄 Todos los comandos fueron registrados/actualizados!');
        }).catch((error) => {
            message.reply(`\`[🦄 cmdPrefix:slashregister]\` ${error.message}`);
        });
    } catch(error) {
        console.error('cmdPrefix:slashregister |',error.message);
    }
}