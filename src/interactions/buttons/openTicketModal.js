// Load required resources =================================================================================================
const { ModalBuilder, TextInputStyle, StringSelectMenuOptionBuilder, MessageFlags } = require('discord.js');

// Load Functions ===========================================================================================================
const { uid } = require('#functions/helpers.js');

// Load SQLite Helper ======================================================================================================
const { readCategory, getMenuCategories } = require('#functions/sqlite.js');

// Module script ===========================================================================================================
module.exports = {
    name: 'openTicketModal',
    async execute(interaction) {
        try {
            const menuUid = (interaction.customId).replace('openTicketModal;', '');
            const uids = getMenuCategories(menuUid);

            if(typeof uids == 'undefined') {
                return interaction.reply({ content: 'Este menú ya no está disponible.', flags: MessageFlags.Ephemeral });
            }

            var categoryOptions = [];
            uids.forEach((catUid) => {
                const catInfo = readCategory(catUid);
                if(typeof catInfo == 'undefined') { return; }

                var emoji;
                try {
                    emoji = JSON.parse(catInfo.emoji);
                } catch(error) {
                    console.error('[interaction:buttons:openticketmodal]', `Emoji inválido en categoría ${catInfo.uid} (${catInfo.name}), se omite: ${error.message}`);
                    return;
                }

                // Nota: Discord no muestra la description de las opciones cuando el select vive dentro de un
                // modal (a diferencia de un select en un mensaje normal), así que no la seteamos acá.
                categoryOptions.push(
                    new StringSelectMenuOptionBuilder().setLabel(catInfo.name).setValue(catInfo.uid).setEmoji(emoji)
                );
            });

            if(categoryOptions.length === 0) {
                return interaction.reply({ content: 'Ninguna de las categorías de este menú está disponible actualmente.', flags: MessageFlags.Ephemeral });
            }

            // El sufijo random evita que Discord precargue en el modal lo que el usuario haya tipeado la vez
            // anterior (el cliente cachea el contenido de un modal por customId).
            const modal = new ModalBuilder()
                .setCustomId(`openTicketModal;${uid(8)}`)
                .setTitle('Abrir Ticket');

            modal.addLabelComponents(
                label => label
                    .setLabel('Categoría')
                    .setStringSelectMenuComponent(select => select
                        .setCustomId('categoria')
                        .addOptions(categoryOptions)
                    ),
                label => label
                    .setLabel('Asunto')
                    .setTextInputComponent(input => input
                        .setCustomId('asunto')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                        .setMaxLength(45)
                    ),
                label => label
                    .setLabel('Descripción breve')
                    .setTextInputComponent(input => input
                        .setCustomId('descripcion')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setMaxLength(250)
                    )
            );

            await interaction.showModal(modal);
        } catch(error) {
            console.error('[interaction:buttons:openticketmodal]', error);
        }
    }
};
