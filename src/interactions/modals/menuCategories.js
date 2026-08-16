// Load required resources =================================================================================================
const { ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

// Load Functions ===========================================================================================================
const { buildV2Embed } = require('#functions/embedV2.js');

// Load SQLite Helper ======================================================================================================
const { readCategory, createMenu } = require('#functions/sqlite.js');

// Module script ===========================================================================================================
module.exports = {
    name: 'menuCategories',
    async execute(interaction) {
        try {
            const selectedUids = interaction.fields.getStringSelectValues('categorias');

            var validCats = [];
            selectedUids.forEach((catUid) => {
                const catInfo = readCategory(catUid);
                if(typeof catInfo == 'undefined') { return; }

                try {
                    catInfo.emoji = JSON.parse(catInfo.emoji);
                } catch(error) {
                    console.error('[interaction:modals:menucategories]', `Emoji inválido en categoría ${catInfo.uid} (${catInfo.name}), se omite: ${error.message}`);
                    return;
                }

                validCats.push(catInfo);
            });

            if(validCats.length === 0) {
                return interaction.reply({ content: 'Ninguna de las categorías seleccionadas es válida.', flags: MessageFlags.Ephemeral });
            }

            // El botón lleva un UID corto que apunta al registro con la lista real de categorías; así el customId
            // no depende de cuántas categorías se elijan (nunca puede pasarse del límite de 100 caracteres de Discord).
            const menuUid = createMenu(interaction.guildId, validCats.map((cat) => cat.uid));

            const openButton = new ButtonBuilder()
                .setCustomId(`openTicketModal;${menuUid}`)
                .setLabel('Abrir Ticket')
                .setEmoji('🎫')
                .setStyle(ButtonStyle.Primary);

            // Fuera de un code block, así `<:nombre:id>` sí renderiza como imagen (adentro de ``` queda como texto crudo).
            const categoriesList = validCats.map((cat) => {
                const icon = cat.emoji.id ? `<:${cat.emoji.name}:${cat.emoji.id}>` : cat.emoji.name;
                return `${icon} **${cat.name}**\n> ${cat.description}`;
            }).join('\n\n');

            const container = buildV2Embed({
                title: 'Bienvenido a nuestro sistema de tickets!',
                description: 'Hacé clic en el botón de abajo para abrir tu ticket de soporte.',
                color: 0x4f30b3
            });

            container
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(textDisplay => textDisplay.setContent(`### Categorías\n\n${categoriesList}`))
                .addActionRowComponents(row => row.addComponents(openButton));

            // send content
            const sender = interaction.guild.channels.cache.get(interaction.channelId);
            await sender.send({ flags: MessageFlags.IsComponentsV2, components: [ container ] });

            interaction.reply({ content: 'Menú creado exitosamente!', flags: MessageFlags.Ephemeral });
        } catch(error) {
            console.error('[interaction:modals:menucategories]', error.message);
        }
    }
};
