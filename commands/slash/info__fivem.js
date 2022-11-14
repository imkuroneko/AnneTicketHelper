// Load required resources =================================================================================================
const { SlashCommandBuilder } = require("discord.js");
const https = require('https');
const rp = require('request-promise');
const cheerio = require('cheerio');

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('fivem')
        .setDescription('Ver información de la plataforma y servicios de cfx.re')
        .setDMPermission(false),
    async execute(interaction) {
        try {
            https.get('https://status.cfx.re/api/v2/status.json', (resp) => {
                let data = '';
                resp.on('data', (chunk) => { data += chunk; });
                resp.on('end', () => {
                    data = JSON.parse(data);
                    switch(data.status.indicator) {
                        case 'major': color = 0xc74040; footer = '🙅🏻‍♀️ Hay inconvenientes en uno o mas servicios, podrían haber inconvenientes para conectarse'; break;
                        case 'minor': color = 0xe39d52; footer = '🙅🏻‍♀️ Hay inconvenientes en uno o mas servicios, pero no deberían haber inconvenientes para conectarse'; break;
                        default:      color = 0x389671; footer = '🙆🏻 No deberían haber inconvenientes para conectarse'; break;
                    }
                });
            });
            
            rp('https://status.cfx.re/').then(function(html) {
                const $ = cheerio.load(html)
                const urlElems = $('div.child-components-container > div.component-inner-container')

                servicios = [];
                for(let i = 0; i < urlElems.length; i++) {
                    const val1 = $(urlElems[i]).find('span.name')[0]
                    const val2 = $(urlElems[i]).find('span.component-status')[0]
                    servicios.push({ name: $(val1).text().replaceAll('"', ""), value: $(val2).text(), inline: true });
                }

                return interaction.reply({ embeds: [ {
                    color: color,
                    title: '🐌 CitizenFX',
                    fields: servicios,
                    footer: { text: 'Bot utilitario para FiveM · Developed by KuroNeko#0001' }
                } ] });

            }).catch(function(err) {
                console.log(err.message);
                return interaction.reply({
                    embeds: [ { color: 0xc74040, title: '💻 CitizenFX', description: 'No se pudo obtener la información de estado de la plataforma cfx.re' } ],
                    ephemeral: true 
                });
            });
        } catch(error) {
            console.error('cmdSlash:fivem |', error.message);
        }
    }
};