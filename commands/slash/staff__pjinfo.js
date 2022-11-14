// Load required resources =================================================================================================
const { SlashCommandBuilder } = require("discord.js");
const { createConnection } = require('mysql');
const path = require('path');

// Load configuration files ================================================================================================
const mysql = require(path.resolve('./config/mysql.json'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('pjinfo')
        .setDescription('Ver información del personaje de un jugador.')
        .addUserOption(option => option.setName('usuario').setDescription('Selecciona un usuario').setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const user = interaction.options.getUser('usuario').id;

            const mysqlConn = createConnection({ multipleStatements: true, host: mysql.host, user: mysql.user, password: mysql.pass, database: mysql.name });

            mysqlConn.connect(function(error) {
                if(error) {
                    mysqlConn.end();
                    return interaction.reply({ embeds: [{
                        color: 0xcc3366,
                        title: '**🥞 Error al conectar con la base de datos**',
                        description: "```ErrNro: "+error.errno+"\nErrCod: "+error.code+"\nErrMsg: "+error.sqlMessage+"\n```"
                    }] });
                }
            });

            try {
                const query_characters = ` SELECT * FROM players WHERE discord = 'discord:${user}'; `;
                mysqlConn.query(query_characters, function(error, resultPjs, fields) {
                    if(error) {
                        return interaction.reply({ embeds: [{
                            color: 0xcc3366,
                            title: '**🥞 Error al ejecutar la consulta SQL**',
                            description: "```ErrNro: "+error.errno+"\nErrCod: "+error.code+"\nErrMsg: "+error.sqlMessage+"\n```"
                        }] });
                    }

                    if(resultPjs.length == 0) {
                        return interaction.reply({ embeds: [{
                            color: 0xb52645,
                            title: '**👤 Usuario no encontrado**',
                            description: 'No se encontraron personajes para el usuario indicado.'
                        }] });
                    }

                    pj_data = [];
                    for(i = 0, k = 1 ; i < resultPjs.length ; i++, k++) {
                        const money = JSON.parse(resultPjs[i].money);
                        const charinfo = JSON.parse(resultPjs[i].charinfo);
                        const job = JSON.parse(resultPjs[i].job);
                        const gang = JSON.parse(resultPjs[i].gang);
                        const gender = (charinfo.gender == '0') ? 'Masculino' : 'Femenino';

                        pj_data.push({
                            name: `👥 ID: \`${resultPjs[i].citizenid}\``,
                            value:
                            "```yaml\n"+
                            `Nombre:           ${charinfo.firstname} ${charinfo.lastname}\n`+
                            `Fecha Nacimiento: ${formatDate(charinfo.birthdate)}\n`+
                            `Telefono:         ${charinfo.phone}\n`+
                            `Genero:           ${gender}\n`+
                            `Trabajo:          ${job.label} (${job.grade.name})\n`+
                            `Org. Criminal:    ${gang.label} (${gang.grade.name})\n`+
                            `Dinero:\n`+
                            `  💳 Banco:      ${formatMoney(money.bank)}\n`+
                            `  💵 Dinero:     ${formatMoney(money.cash)}\n`+
                            `  💮 Puntos:     ${formatMoney(money.stracoins)}\n`+
                            "```"
                        });

                        function formatMoney(n) {
                            return n.toLocaleString().split(".")[0].replace(',','.');
                        }
                        function formatDate(date) {
                            d = date.split("-");
                            return `${d[2]}/${d[1]}/${d[0]}`;
                        }
                    }

                    return interaction.reply({ embeds: [{
                        color: 0x35c1d4,
                        title: `**🪪 Personajes encontrados**`,
                        fields: pj_data
                    }] });
                });   
            } catch(error) {
                console.error('cmdSlash:pjInfo:GetPlayers |', error.message);
            }
        } catch(error) {
            console.error('cmdSlash:pjinfo |', error.message);
        }
    }
};