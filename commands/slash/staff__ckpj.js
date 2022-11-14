// Load required resources =================================================================================================
const { SlashCommandBuilder } = require("discord.js");
const { createConnection } = require('mysql');
const path = require('path');

// Load configuration files ================================================================================================
const mysql = require(path.resolve('./config/mysql.json'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ckpj')
        .setDescription('Realizar el CK de un jugador')
        .addStringOption(option => option.setName('licencia').setDescription('Licencia del usuario').setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const mysqlConn = createConnection({ multipleStatements: true, host: mysql.host, user: mysql.user, password: mysql.pass, database: mysql.name });

            mysqlConn.connect((error) => {
                if(error) {
                    mysqlConn.end();
                    return interaction.reply({ embeds: [{
                        color: 0xcc3366,
                        title: '**🥞 Error al conectar con la base de datos**',
                        description: "```ErrNro: "+error.errno+"\nErrCod: "+error.code+"\nErrMsg: "+error.sqlMessage+"\n```"
                    }] });
                }
            });

            var licencia = interaction.options.getString('licencia');
            var licencia = licencia.replace('license:', '');
            var licencia = licencia.replace(/[^a-z0-9]/gi, '');

            if(licencia.length < 32) {
                return interaction.reply({ content: '❌ No tienes permiso para utilizar este comando...', ephemeral: true });
            }

            const query_player = ` SELECT
                    concat(u.firstname,' ',u.lastname) AS nombre_pj,
                    g.phone_number AS gks_phone,
                    JSON_UNQUOTE(JSON_EXTRACT(i.identifiers, '$.steam')) AS steam,
                    JSON_UNQUOTE(JSON_EXTRACT(i.identifiers, '$.license')) AS license,
                    JSON_UNQUOTE(JSON_EXTRACT(i.identifiers, '$.discord')) AS discord
                FROM players_external_informations i, users u, gksphone_settings g
                WHERE g.identifier = u.identifier
                AND u.identifier = JSON_UNQUOTE(JSON_EXTRACT(i.identifiers, '$.license'))
                AND JSON_UNQUOTE(JSON_EXTRACT(i.identifiers, '$.license')) = '${license}';
            `;

            mysqlConn.query(query_player, (error, resultPlayer, fields) => {
                if(error) {
                    return interaction.reply({ embeds: [{
                        color: 0xcc3366,
                        title: '**🥞 Error al ejecutar la consulta SQL**',
                        description: "```ErrNro: "+error.errno+"\nErrCod: "+error.code+"\nErrMsg: "+error.sqlMessage+"\n```"
                    }] });
                }

                if(resultPlayer.length == 0) {
                    return interaction.reply({ embeds: [{
                        color: 0xb52645,
                        title: '**👤 Usuario no encontrado**',
                        description: `No se ha encontrado la licencia \`${licencia}\` en la base de datos.`
                    }] });
                }

                const playerName = resultPlayer[0].nombre_pj;
                const playerPhone = resultPlayer[0].gks_phone;
                const playerLicense = resultPlayer[0].license;
                const playerSteam = resultPlayer[0].steam;
                const playerDiscord = resultPlayer[0].discord;

                const big_query = `
                    DELETE FROM ${mysql.name}.billing WHERE identifier = '${playerLicense}';
                    DELETE FROM ${mysql.name}.boosting WHERE identifier = '${playerLicense}';
                    DELETE FROM ${mysql.name}.boosting_users WHERE identifier = '${playerLicense}';
                    DELETE FROM ${mysql.name}.cd_dispatch WHERE identifier = '${playerLicense}';
                    DELETE FROM ${mysql.name}.cd_garage_keys WHERE owner_identifier = '${playerLicense}';
                    DELETE FROM ${mysql.name}.cd_garage_keys WHERE reciever_identifier = '${playerLicense}';
                    DELETE FROM ${mysql.name}.cd_garage_privategarage WHERE identifier = '${playerLicense}';
                    DELETE FROM ${mysql.name}.communityservice WHERE identifier = '${playerLicense}';
                    DELETE FROM ${mysql.name}.datastore_data WHERE owner = '${playerLicense}';
                    DELETE FROM ${mysql.name}.gacha_peds WHERE identifier = '${playerLicense}';

                    DELETE FROM ${mysql.name}.gksphone_settings WHERE identifier = '${playerLicense}';
                    DELETE FROM ${mysql.name}.gksphone_app_chat WHERE sendcid = '${playerPhone}';
                    DELETE FROM ${mysql.name}.gksphone_bank_transfer WHERE identifier = '${playerLicense}';
                    DELETE FROM ${mysql.name}.gksphone_blockednumber WHERE identifier = '${playerLicense}';
                    DELETE FROM ${mysql.name}.gksphone_calls WHERE owner = '${playerPhone}';
                    DELETE FROM ${mysql.name}.gksphone_ebay WHERE cid = '${playerPhone}';
                    DELETE FROM ${mysql.name}.gksphone_gallery WHERE hex = '${playerLicense}';
                    DELETE FROM ${mysql.name}.gksphone_gameleaderboard WHERE owner = '${playerLicense}';
                    DELETE FROM ${mysql.name}.gksphone_gps WHERE hex = '${playerLicense}';
                    DELETE FROM ${mysql.name}.gksphone_group_message WHERE ownerphone = '${playerPhone}';
                    DELETE FROM ${mysql.name}.gksphone_job_message WHERE number = '${playerPhone}';
                    DELETE FROM ${mysql.name}.gksphone_messages WHERE transmitter = '${playerPhone}';
                    DELETE FROM ${mysql.name}.gksphone_messages WHERE receiver = '${playerPhone}';
                    DELETE FROM ${mysql.name}.gksphone_messages_group WHERE ownerphone = '${playerPhone}';
                    DELETE FROM ${mysql.name}.gksphone_news WHERE hex = '${playerLicense}';
                    DELETE FROM ${mysql.name}.gksphone_user_contacts WHERE identifier = '${playerLicense}';
                    DELETE FROM ${mysql.name}.gksphone_yellow WHERE phone_number = '${playerPhone}';

                    DELETE FROM ${mysql.name}.inside_jobs WHERE identifier = '${playerLicense}';
                    DELETE FROM ${mysql.name}.kq_extra WHERE player = '${playerLicense}';
                    DELETE FROM ${mysql.name}.okokbanking_transactions WHERE receiver_identifier = '${playerLicense}';
                    DELETE FROM ${mysql.name}.okokbanking_transactions WHERE sender_identifier = '${playerLicense}';

                    DELETE FROM ${mysql.name}.playerstattoos WHERE identifier = 'steam:${playerSteam}';
                    DELETE FROM ${mysql.name}.xsoundboard WHERE steamid = 'steam:${playerSteam}';
                    DELETE FROM ${mysql.name}.user_jobs WHERE identifier = '${playerLicense}';
                    DELETE FROM ${mysql.name}.user_levels WHERE identifier = '${playerLicense}';
                    DELETE FROM ${mysql.name}.user_licenses WHERE owner = '${playerLicense}';
                    DELETE FROM ${mysql.name}.user_properties WHERE userId = '${playerLicense}';
                `;

                mysqlConn.beginTransaction((error) => {
                    if(error) {
                        return interaction.reply({ embeds: [{
                            color: 0xcc3366,
                            title: '**🥞 Error al ejecutar preparar la consulta a ejecutar!**',
                            description: "```ErrNro: "+error.errno+"\n\nErrCod: "+error.code+"\n\nErrMsg: "+error.sqlMessage+"\n```",
                            footer: { 'text' : 'Por favor intentalo nuevamente en unos instantes.' }
                        }] });
                    }

                    mysqlConn.query(big_query, (error, result, fields) => {
                        if(error) {
                            mysqlConn.rollback();
                            return interaction.reply({ embeds: [{
                                color: 0xcc3366,
                                title: '**🥞 Error al ejecutar la consulta!**',
                                description: "```ErrNro: "+error.errno+"\n\nErrCod: "+error.code+"\n\nErrMsg: "+error.sqlMessage+"\n```",
                                footer: { 'text' : 'Por favor intentalo nuevamente en unos instantes.' }
                            }] });
                        }

                        mysqlConn.commit((error) => {
                            if(error) {
                                mysqlConn.rollback();
                                return interaction.reply({ embeds: [{
                                    color: 0xcc3366,
                                    title: '**🥞 Error al procesar el CK!**',
                                    description: "```ErrNro: "+error.errno+"\n\nErrCod: "+error.code+"\n\nErrMsg: "+error.sqlMessage+"\n```",
                                    footer: { 'text' : 'Por favor intentalo nuevamente en unos instantes.' }
                                }] });
                            }
    
                            mysqlConn.end();

                            return interaction.reply({ embeds: [ {
                                color: 0x32a852,
                                title: '🕯 CK Realizado',
                                fields: [
                                    { name: 'Datos del jugador', value: "```\nNombre y Apellido: "+playerName+"```" },
                                    { name: 'Staff encargado', value: `<@${interaction.user.id}>` },
                                ],
                                footer: { 'text' : 'Developed by KuroNeko#0001' }
                            } ] });
                        });
                    });
                });
            });   
        } catch(error) {
            console.error('cmdSlash:pjInfo:GetPlayerInfo |', error.message);
        }
    }
};