// Load required resources =================================================================================================
const { SlashCommandBuilder } = require("discord.js");
const { createConnection } = require('mysql');
const path = require('path');

// Load configuration files ================================================================================================
const mysql = require(path.resolve('./config/mysql.json'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Ver información de un usuario.')
        .addUserOption(option => option.setName('target').setDescription('Selecciona un usuario').setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        const user = interaction.options.getUser('target').id;

        try {
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

            const sql_query = ` SELECT * FROM user_credentials WHERE discordId = '${user}'; `;

            mysqlConn.query(sql_query, function(error, result, fields) {
                if(error) {
                    return interaction.reply({ embeds: [{
                        color: 0xcc3366,
                        title: '**🥞 Error al ejecutar la consulta SQL**',
                        description: "```ErrNro: "+error.errno+"\nErrCod: "+error.code+"\nErrMsg: "+error.sqlMessage+"\n```"
                    }] });
                }

                if(result.length == 0) {
                    return interaction.reply({ embeds: [{
                        color: 0xb52645,
                        title: '**👤 Usuario no encontrado**',
                        description: `El usuario <@${user}> no se encuentra registrado en la base de datos`
                    }] });
                }

                const data = result[0];

                return interaction.reply({ embeds: [{
                    color: 0x35c1d4,
                    title: `**🪪 Datos del usuario: ${data.name}**`,
                    description: "```yaml\n"+
                        `FivemId:    ${data.fivem}\n`+
                        `Licencia1:  ${data.license1}\n`+
                        `Licencia2:  ${data.license2}\n`+
                        `Steam:      ${data.steamId}\n`+
                        `Discord:    ${data.discordId}\n`+
                    "```"
                }] });
            });
        } catch(error) {
            console.error('cmdSlash:user |', error.message);
        }
    }
};
