// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

// Load Functions ===========================================================================================================
const { buildV2Embed } = require('#functions/embedV2.js');

// Load SQLite Helper ======================================================================================================
const { readCategory } = require('#functions/sqlite.js');

const BUTTON_PREFIX = 'openTicketModal;';

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
                validCats.push(catInfo);
            });

            if(validCats.length === 0) {
                return interaction.reply({ content: 'Ninguna de las categorías seleccionadas es válida.', ephemeral: true });
            }

            // El customId del botón lleva los UIDs de categoría codificados; Discord limita los customId a 100
            // caracteres, así que si no entran todas se recorta la lista (cada UID mide 8 caracteres + separador).
            var selectedForButton = [];
            for(const cat of validCats) {
                const candidateId = `${BUTTON_PREFIX}${[...selectedForButton, cat].map((c) => c.uid).join(',')}`;
                if(candidateId.length > 100) { break; }
                selectedForButton.push(cat);
            }
            const customId = `${BUTTON_PREFIX}${selectedForButton.map((c) => c.uid).join(',')}`;

            // build button + container (Components V2)
            const openButton = new ButtonBuilder()
                .setCustomId(customId)
                .setLabel('Abrir Ticket')
                .setEmoji('🎫')
                .setStyle(ButtonStyle.Primary);

            const container = buildV2Embed({
                title: 'Bienvenido a nuestro sistema de tickets!',
                description: 'Hacé clic en el botón de abajo para abrir tu ticket de soporte.',
                color: 0x4f30b3,
                button: openButton
            });

            // send content
            const sender = interaction.guild.channels.cache.get(interaction.channelId);
            await sender.send({ flags: MessageFlags.IsComponentsV2, components: [ container ] });

            var replyMsg = 'Menú creado exitosamente!';
            if(selectedForButton.length < validCats.length) {
                replyMsg += ` (se incluyeron solo ${selectedForButton.length} de ${validCats.length} categorías por el límite de longitud de Discord en botones)`;
            }

            interaction.reply({ content: replyMsg, ephemeral: true });
        } catch(error) {
            console.error(color.red('[interaction:modals:menucategories]'), error.message);
        }
    }
};
