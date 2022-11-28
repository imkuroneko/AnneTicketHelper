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

        rest.get(Routes.applicationCommands(clientId)).then((data) => {
            const promises = [];
            for(const command of data) {
                const deleteUrl = `${Routes.applicationCommands(clientId)}/${command.id}`;
                promises.push(rest.delete(deleteUrl));
            }
            Promise.all(promises);
        });

        return message.reply('🦄 Todos los comandos slash fueron eliminados');
    } catch(error) {
        console.error('cmdPrefix:slashdeleter |',error.message);
    }
}