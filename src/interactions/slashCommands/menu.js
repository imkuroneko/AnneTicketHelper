// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { SlashCommandBuilder, ModalBuilder, StringSelectMenuOptionBuilder, MessageFlags } = require('discord.js');

// Load Functions ===========================================================================================================
const { truncate } = require('#functions/helpers.js');

// Load SQLite Helper ======================================================================================================
const { listCategoriesByGuild } = require('#functions/sqlite.js');

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('menu')
        .setDescription('Crear menú de soporte')
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const categorias = listCategoriesByGuild(interaction.guildId);

            var options = [];
            categorias.forEach((cat) => {
                var emoji;
                try {
                    emoji = JSON.parse(cat.emoji);
                } catch(error) {
                    console.error(color.red('[interaction:slashcmd:menu]'), `Emoji inválido en categoría ${cat.uid} (${cat.name}), se omite: ${error.message}`);
                    return;
                }

                options.push(new StringSelectMenuOptionBuilder().setLabel(cat.name).setValue(cat.uid).setEmoji(emoji).setDescription(truncate(cat.description, 100)));
            });

            if(options.length === 0) {
                return interaction.reply({ content: 'No hay categorías válidas registradas en este servidor. Creá una con `/categorias crear`.', flags: MessageFlags.Ephemeral });
            }

            // Los select menu de Discord admiten un máximo de 25 opciones
            if(options.length > 25) { options = options.slice(0, 25); }

            const modal = new ModalBuilder()
                .setCustomId('menuCategories')
                .setTitle('Crear menú de tickets');

            modal.addLabelComponents(
                label => label
                    .setLabel('Categorías a incluir en este menú')
                    .setStringSelectMenuComponent(select => select
                        .setCustomId('categorias')
                        .setMinValues(1)
                        .setMaxValues(options.length)
                        .addOptions(options)
                    )
            );

            await interaction.showModal(modal);
        } catch(error) {
            console.error(color.red('[interaction:slashcmd:menu]'), error.message);
        }
    }
};
