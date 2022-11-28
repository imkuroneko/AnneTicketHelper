// Load required resources =================================================================================================
const { Events, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Module script ===========================================================================================================
module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        try {
            client.user.setPresence({ activities: [{ name: 'Los tickets de soporte 🎫', type: ActivityType.Watching }], status: 'dnd' });

            try {
                const cronsFiles = fs.readdirSync(path.resolve('./crons')).filter(file => file.endsWith('.js'));
                if(cronsFiles.length) {
                    for(file of cronsFiles) {
                        const cron = require(path.resolve(`./crons/${file}`))(client);
                        cron.start();
                    }
                }
            } catch(error) {
                console.error('[djs] load:crons |', error.message);
            }
        } catch(error) {
            console.error('[djs] event:ready |', error.message);
        }

        console.log('[init] Bot operativo!');
    }
};