// Load required resources =================================================================================================
const { Events, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load configuration files ================================================================================================
const presence = require(path.resolve('./config/presence.json'));

// Module script ===========================================================================================================
module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        try {
            if(presence.statusMsg.length > 0) {
                client.user.setPresence({ activities: [{ name: presence.statusMsg, type: ActivityType.Watching }], status: 'dnd' });
            }

            if(presence.voiceChannel.length > 0) {
                const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
                const voiceChannel = client.channels.cache.get(presence.voiceChannel);

                var conn = connectToVoice(voiceChannel);

                conn.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                    conn = connectToVoice(voiceChannel);
                });

                function connectToVoice(channel) {
                    return joinVoiceChannel({
                        channelId: channel.id,
                        guildId: channel.guild.id,
                        adapterCreator: channel.guild.voiceAdapterCreator,
                        selfDeaf: false
                    });
                }
            }

            try {
                const cronsFiles = fs.readdirSync(path.resolve('./crons')).filter(file => file.endsWith('.js'));
                if(cronsFiles.length) {
                    for(file of cronsFiles) {
                        const cron = require(path.resolve(`./crons/${file}`))(client);
                        cron.start()
                    }
                }
            } catch(error) {
                console.error('load:crons |', error.message);
            }
        } catch(error) {
            console.error('event:ready |', error.message);
        }

        console.log('[init] Bot operativo!');
    }
};