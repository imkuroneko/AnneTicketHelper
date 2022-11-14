// Load required resources =================================================================================================
const { Events } = require('discord.js');
const path = require('path');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');

// Load custom functions ===================================================================================================
const dbWhitelist = require(path.resolve('./functions/whitelist'));

// Load configuration files ================================================================================================
const { waitingChannel, hoursBetweenAttempts } = require(path.resolve('./config/whitelist.json'));
const { clientId, timezoneSv } = require(path.resolve('./config/bot.json'));

// Module script ===========================================================================================================
module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {

        if(newState.id == clientId) { return; }

        const userId = newState.id;

        try {
            if(waitingChannel.length > 0 && waitingChannel == newState.channelId) {
                const totalAttempts = dbWhitelist.countFailedAttempts(userId);
                if(totalAttempts > 0) {
                    dayjs.extend(timezone);
                    dayjs.tz.setDefault(timezoneSv);

                    const lastAttempt = dayjs(dbWhitelist.getLastFailedAttemptTimestamp(userId));
                    const curDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
                    const diffDate = dayjs(curDate).diff(lastAttempt, 'minute');

                    const minuteBetweenAttempts = (hoursBetweenAttempts * 60);

                    if(diffDate < minuteBetweenAttempts) {
                        newState.member.voice.disconnect();
                    }
                }
            }
        } catch(error) {
            console.error('event:voiceStateUpdate |', error.message);
        }
    }
};