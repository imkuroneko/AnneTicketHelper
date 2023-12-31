// Load required resources =================================================================================================
const path = require('path');
const md5 = require('md5');
const { color } = require('console-log-colors');
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

// Load SQLite Helper ======================================================================================================
const sqlite = require(path.resolve('./functions/sqlite.js'));

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

            // validate categories
            var validCats = [];
            await catsAsObj.forEach(async (cat) => {
                var catInfo = await sqlite.readCategory(cat.trim());
                if(typeof catInfo != 'undefined') { validCats.push(catInfo); }
            });

            // build embed
            var fieldsContent = [];
            validCats.forEach(async (cat) => {
                fieldsContent.push({ name: `**${cat.name}**`, value: cat.description });
            });

            // build menu
            var selectOptions = [];
            validCats.forEach(async (cat) => {
                let emojiRecovered = JSON.parse(cat.emoji);

                if(emojiRecovered.length == 1) {
                    emoji = emojiRecovered.name;
                } else {
                    emoji = emojiRecovered;
                }

                var optionAdd = { label: cat.name, value: 'createTicket;'+cat.uid, emoji: emoji };
                selectOptions.push(optionAdd);
            });

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