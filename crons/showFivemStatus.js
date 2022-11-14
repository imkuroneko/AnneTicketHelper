// Load required resources =================================================================================================
const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const path = require('path');
const cron = require('cron');
const axios = require('axios');

// Load configuration files ================================================================================================
const fivem = require(path.resolve('./config/fivem.json'));
const { timezone } = require(path.resolve('./config/bot.json'));

// Module script ===========================================================================================================
const script = (client) => new cron.CronJob(
    '*/5 * * * *',
    function() {
        try {
            fivem.forEach((server) => {
                client.channels.fetch(server.channel).then((channel) => {
                    channel.messages.fetch(server.message).then((message) => {
                        // const urlFivem = `https://servers-frontend.fivem.net/api/servers/single/${server.sid}`; // some day we will figure out how to read this endpoint
                        const urlFivem = `http://${server.ip}:${server.port}/dynamic.json`;
                        const headerRequest = { headers: { 'User-Agent': 'Mozilla/5.0' } };
    
                        axios.get(urlFivem, headerRequest).then((res) => {
                            if(res.status != 200) { throw 'error uwu'; }

                            let embed_content = [{
                                color: 0x7fd64d,
                                title: server.title,
                                fields: [
                                    { inline: true, name: "Estado", value: "✅ **Server ON**" },
                                    { inline: true, name: "Slots", value: "**"+res.data.clients+"/"+res.data.sv_maxclients+"**" },
                                    { inline: false, name: "Acceder al servidor", value: "• Vía Web: https://cfx.re/join/"+server.sid+"/\n• Por Consola: `connect "+server.sid+"`\n• Enlace <fivem://"+server.sid+">" },
                                    { inline: false, name: "Horas de Reinicio (PYT)", value: "`08:00` | `16:00`" },
                                ]
                            }];

                            let embed_buttons = new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setURL(`https://cfx.re/join/${server.sid}`).setLabel('🔌 Conectar').setStyle(ButtonStyle.Link),
                            );
                            message.edit({ embeds: embed_content, components: [ embed_buttons ] });

                        }).catch((error) => {
                            let embed_content = [{
                                color: 0xbf3442,
                                title: server.title,
                                description: "El servidor no se encuentra disponible temporalmente.\nPodrás encontrar mas información al respecto en el canal de Anuncios"
                            }];
                            message.edit({ embeds: embed_content, components: [] });
                        });
                    });
                });
            });
        } catch(error) {
            console.error('cronjob:showFivemStatus', error.code);
        };
    }, null, false, timezone);


// Module export ===========================================================================================================
module.exports = script;