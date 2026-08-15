// Load required resources =================================================================================================
const path = require('path');
const { color } = require('console-log-colors');
const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

// Load Functions ===========================================================================================================
const { buildV2Embed } = require('../../functions/embedV2.js');

// Load SQLite Helper ======================================================================================================
const { readCategory } = require('../../functions/sqlite.js');

const BUTTON_PREFIX = 'openTicketModal;';

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
                    JSON.parse(catInfo.emoji);
                } catch(error) {
                    console.error(color.red('[interaction:slashcmd:menu]'), `Emoji inválido en categoría ${catInfo.uid} (${catInfo.name}), se omite del menú: ${error.message}`);
                    return;
                }

                validCats.push(catInfo);
            });

            if(validCats.length === 0) {
                return interaction.reply({ content: 'Ninguna de las categorías indicadas es válida.', ephemeral: true });
            }

            // El customId del botón lleva los UIDs de categoría codificados; Discord limita los customId a 100
            // caracteres, así que si no entran todas se recorta la lista (cada UID mide 8 caracteres + separador).
            var selectedCats = [];
            for(const cat of validCats) {
                const candidateId = `${BUTTON_PREFIX}${[...selectedCats, cat].map((c) => c.uid).join(',')}`;
                if(candidateId.length > 100) { break; }
                selectedCats.push(cat);
            }
            const customId = `${BUTTON_PREFIX}${selectedCats.map((c) => c.uid).join(',')}`;

            // build button + container (Components V2)
            const openButton = new ButtonBuilder()
                .setCustomId(customId)
                .setLabel('Abrir Ticket')
                .setEmoji('🎫')
                .setStyle(ButtonStyle.Primary);

            const container = buildV2Embed({
                title: 'Bienvenido a nuestro sistema de tickets!',
                description: 'Hacé clic en el botón de abajo para abrir un ticket de soporte. Vas a poder elegir la categoría, indicar un asunto y contarnos brevemente tu consulta.',
                color: 0x4f30b3,
                button: openButton
            });

            // send content
            const sender = interaction.member.guild.channels.cache.get(interaction.channelId);
            await sender.send({ flags: MessageFlags.IsComponentsV2, components: [ container ] });

            var replyMsg = 'Menú creado exitosamente!';
            if(selectedCats.length < validCats.length) {
                replyMsg += ` (se incluyeron solo ${selectedCats.length} de ${validCats.length} categorías por el límite de longitud de Discord en botones)`;
            }

            interaction.reply({ content: replyMsg, ephemeral: true });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd:menu]'), error.message);
        }
    }
};
