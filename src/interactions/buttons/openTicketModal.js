// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { ModalBuilder, TextInputStyle, StringSelectMenuOptionBuilder } = require('discord.js');

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
                return interaction.reply({ content: 'Este menú ya no está disponible.', ephemeral: true });
            }

            var categoryOptions = [];
            uids.forEach((catUid) => {
                const catInfo = readCategory(catUid);
                if(typeof catInfo == 'undefined') { return; }

                var emoji;
                try {
                    emoji = JSON.parse(catInfo.emoji);
                } catch(error) {
                    console.error(color.red('[interaction:buttons:openticketmodal]'), `Emoji inválido en categoría ${catInfo.uid} (${catInfo.name}), se omite: ${error.message}`);
                    return;
                }

                categoryOptions.push(
                    new StringSelectMenuOptionBuilder().setLabel(catInfo.name).setValue(catInfo.uid).setEmoji(emoji)
                );
            });

            if(categoryOptions.length === 0) {
                return interaction.reply({ content: 'Ninguna de las categorías de este menú está disponible actualmente.', ephemeral: true });
            }

            const modal = new ModalBuilder()
                .setCustomId('openTicketModal')
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
            console.error(color.red('[interaction:buttons:openticketmodal]'), error);
        }
    }
};
