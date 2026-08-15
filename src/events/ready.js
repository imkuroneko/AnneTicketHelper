// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { Events, ActivityType } = require('discord.js');

// Module script ===========================================================================================================
module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        try {
            client.user.setPresence({ activities: [{ name: 'Los tickets de soporte 🎫', type: ActivityType.Watching }], status: 'dnd' });
        } catch(error) {
            console.error(color.red('[event:ready]'), error.message);
        }
    }
};