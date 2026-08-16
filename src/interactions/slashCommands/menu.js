// Load required resources =================================================================================================
const { SlashCommandBuilder, ModalBuilder, StringSelectMenuOptionBuilder, MessageFlags } = require('discord.js');

// Load Functions ===========================================================================================================
const { uid } = require('#functions/helpers.js');

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
                    console.error('[interaction:slashcmd:menu]', `Emoji inválido en categoría ${cat.uid} (${cat.name}), se omite: ${error.message}`);
                    return;
                }

                // Nota: Discord no muestra la description de las opciones cuando el select vive dentro de un
                // modal (a diferencia de un select en un mensaje normal), así que no la seteamos acá.
                options.push(new StringSelectMenuOptionBuilder().setLabel(cat.name).setValue(cat.uid).setEmoji(emoji));
            });

            if(options.length === 0) {
                return interaction.reply({ content: 'No hay categorías válidas registradas en este servidor. Creá una con `/categorias crear`.', flags: MessageFlags.Ephemeral });
            }

            // Los select menu de Discord admiten un máximo de 25 opciones
            if(options.length > 25) { options = options.slice(0, 25); }

            // El sufijo random evita que Discord precargue en el modal lo que se haya elegido la vez anterior
            // (el cliente cachea el contenido de un modal por customId).
            const modal = new ModalBuilder()
                .setCustomId(`menuCategories;${uid(8)}`)
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
            console.error('[interaction:slashcmd:menu]', error.message);
        }
    }
};
