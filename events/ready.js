// Load required resources =================================================================================================
const { Events, ActivityType } = require('discord.js');

// Module script ===========================================================================================================
module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        try {
            client.user.setPresence({ activities: [{ name: 'Los tickets de soporte 🎫', type: ActivityType.Watching }], status: 'dnd' });

            console.log('[init] Bot operativo!');
        } catch(error) {
            console.error('[djs] event:ready |', error.message);
        }
    }
};