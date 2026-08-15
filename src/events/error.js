// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { Events } = require('discord.js');

// Module script ===========================================================================================================
module.exports = {
    name: Events.Error,
    async execute(error) {
        console.error(color.red('[djs] mainErrorTracker'), error.message);
    }
}