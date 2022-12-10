// Load required resources =================================================================================================
const path = require('path');
const { color } = require('console-log-colors');
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

// Load SQLite Helper ======================================================================================================
const sqlite = require(path.resolve('./functions/sqlite.js'));

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('menucreator')
        .setDescription('Crear menú de soporte')
        .addStringOption(option => option.setName('categorias').setDescription('UIDs de las categorías separados entre comas "," (ej: 1,2,3,4)').setRequired(true).setMinLength(3))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const categorias = interaction.options.getString('categorias');

            console.log(color.green('[DEBUG] categorias:    '), categorias.split(','));

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('estoPodriaSerRandom'+(new Date()).toString())
                    .setPlaceholder('Seleccione la categoría')
                    .addOptions(
                        { label: 'Select me', value: 'createTicket;first_option', emoji: { name: '🍕' } },
                        { label: 'You can select me too', value: 'createTicket;second_option', emoji: { name: '🍕' } },
                    ),
            );

            await interaction.reply({ content: 'Pong!', components: [row] });

            // const content = `
            //     Listar cada categoría con su descripción y emoji; agregar también el selectMenu
            // `;

            // interaction.reply({ embeds: [{ color: 0x4f30b3, description: content, }], ephemeral: true });

            // add enviador aquí

        } catch(error) {
            console.error(color.red('[interaction:slashcmd:catnuevo]'), error.message);
        }
    }
};