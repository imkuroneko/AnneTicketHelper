// Load required resources =================================================================================================
const path = require('path');
const cron = require('cron');

// Load configuration files ================================================================================================
const config = require(path.resolve('./config/restarts.json'));
const { timezone } = require(path.resolve('./config/bot.json'));

// Load custom functions ===================================================================================================
const utils = require(path.resolve('./functions/utilitarios'));

// Module script ===========================================================================================================
const script = (client) => new cron.CronJob(
    '0 0 * * *', // ejecutar a las 00:00
    function() {
        try {
            const hora1 = Math.floor(utils.getTimestampForHour(08, 00) / 1000);
            const hora2 = Math.floor(utils.getTimestampForHour(16, 00) / 1000);

            client.channels.fetch(config.channel).then((channel) => {
                channel.messages.fetch(config.message).then((message) => {
                    let embed_content = [{
                        color: 0xbf3442,
                        title: "⏰ Reinicios Programados",
                        description:
                            "**El servidor tendrá reinicios programados a las siguientes horas:**\n\n"+
                            ` • **<t:${hora1}:t>** (<t:${hora1}:R>)\n`+
                            ` • **<t:${hora2}:t>** (<t:${hora2}:R>)\n`,
                        footer: { text: 'Favor tener en cuenta para las actividades que tengan planeada en el día' }
                    }];
                    message.edit({ embeds: embed_content });
                });
            });
        } catch(error) {
            console.error('cronjob:sendAlertsRestart', error.code);
        };
    }, null, false, timezone);


// Module export ===========================================================================================================
module.exports = script;