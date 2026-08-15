// Load required resources =================================================================================================
const path = require('path');
const md5 = require('md5');
const { color } = require('console-log-colors');
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

// Load SQLite Helper ======================================================================================================
const { readCategory } = require('../../functions/sqlite.js');

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('menu')
        .setDescription('Crear menú de soporte')
        .addStringOption(option => option.setName('categorias').setDescription('UIDs de las categorías separados entre comas "," (ej: 1,2,3,4)').setRequired(true).setMinLength(3))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            // get content
            const categorias = interaction.options.getString('categorias');
            const catsAsObj = categorias.split(',');

            // validate categories (y descarta las que tengan el emoji corrupto)
            var validCats = [];
            catsAsObj.forEach((cat) => {
                var catInfo = readCategory(cat.trim());
                if(typeof catInfo == 'undefined') { return; }

                try {
                    catInfo.emoji = JSON.parse(catInfo.emoji);
                } catch(error) {
                    console.error(color.red('[interaction:slashcmd:menu]'), `Emoji inválido en categoría ${catInfo.uid} (${catInfo.name}), se omite del menú: ${error.message}`);
                    return;
                }

                validCats.push(catInfo);
            });

            if(validCats.length === 0) {
                return interaction.reply({ content: 'Ninguna de las categorías indicadas es válida.', ephemeral: true });
            }

            // build embed
            var fieldsContent = validCats.map((cat) => ({ name: `**${cat.name}**`, value: cat.description }));

            // build menu
            var selectOptions = validCats.map((cat) => ({ label: cat.name, value: 'createTicket;'+cat.uid, emoji: cat.emoji }));

            const menu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(md5(new Date()).toString())
                    .setPlaceholder('Seleccione la categoría')
                    .addOptions(selectOptions)
            );

            // send content
            const sender = await interaction.member.guild.channels.cache.get(interaction.channelId);
            await sender.send({ embeds: [{
                    color: 0x4f30b3,
                    title: "**Bienvenido a nuestro sistema de tickets!**",
                    description: 'Por favor, seleccione en el menú de abajo la categoría correspondiente para abrir su ticket',
                    fields: fieldsContent
                }],
                components: [ menu ]
            });

            interaction.reply({ content: 'Menú creado exitosamente!', ephemeral: true });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd:catnuevo]'), error.message);
        }
    }
};