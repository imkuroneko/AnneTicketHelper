// Load required resources =================================================================================================
const { SlashCommandBuilder } = require("discord.js");
const { createConnection } = require('mysql');
const path = require('path');

// Load configuration files ================================================================================================
const mysql = require(path.resolve('./config/mysql.json'));

// Additional Data =========================================================================================================
const tipoDinero = [
    { name: '💵 Dinero efectivo', value: 'money' },
    { name: '💶 Dinero ilegal', value: 'black' },
    { name: '💳 Dinero en banco', value: 'bank' },
    { name: '🪙 Puntos', value: 'culichicoin' },
];

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('topmoney')
        .setDescription('Ver el top de jugadores según el tipo de dinero seleccionado.')
        .addStringOption(option => option.setName('tipo_dinero').setDescription('El tipo de dinero').setRequired(true).addChoices(...tipoDinero))
        .setDMPermission(false),
    async execute(interaction) {
        const searchDinero = interaction.options.getString('tipo_dinero');

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

            const sql_query = ""+
                " SELECT CONCAT(firstname,' ', lastname) AS user_name, identifier, CAST(JSON_EXTRACT(accounts, '$."+searchDinero+"') as INT) AS money "+
                " FROM users "+
                " ORDER BY money DESC "+
                " LIMIT 15 ";

            mysqlConn.query(sql_query, function(error, result, fields) {
                if(error) {
                    return interaction.reply({ embeds: [{
                        color: 0xcc3366,
                        title: '**🥞 Error al ejecutar la consulta SQL**',
                        description: "```ErrNro: "+error.errno+"\nErrCod: "+error.code+"\nErrMsg: "+error.sqlMessage+"\n```"
                    }] });
                }

                if(result.length == 0) {
                    return interaction.reply({ embeds: [{ color: 0xb52645, title: '**👤 Datos no encontrados**', description: 'No se encontraron datos en la tabla solicitada' }] });
                }

                top_data = "";
                for(i = 0, k = 1 ; i < result.length ; i++, k++) {
                    top_data += `[${k}] ${result[i].user_name}: ${formatMoney(result[i].money)}\n`;
                    function formatMoney(n) { return n.toLocaleString().split(".")[0].replaceAll(',','.'); }
                }

                return interaction.reply({ embeds: [{
                    color: 0x6fd2e8,
                    title: `Top 15 de usuarios con mayor cantidad de ${searchDinero}`,
                    description: "```"+top_data+"```",
                }] });
            });   
        } catch(error) {
            console.error('cmdSlash:user |', error.message);
        }
    }
};
