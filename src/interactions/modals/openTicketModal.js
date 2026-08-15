// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { ChannelType, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

// Load configuration files ================================================================================================
const { clientId, staffRole } = require('#config/params.json');
const { template, footer } = require('#data/embeds.json');

// Load SQLite Helper ======================================================================================================
const { readCategory, countOpenTicketsByUser, generateTicketId, createNewTicket } = require('#functions/sqlite.js');

// Module script ===========================================================================================================
module.exports = {
    name: 'openTicketModal',
    async execute(interaction) {
        try {
            const userId  = interaction.user.id;
            const userTag = interaction.user.tag;
            const guildId = interaction.guildId;

            const categoryUid = interaction.fields.getStringSelectValues('categoria')[0];
            const subject = interaction.fields.getTextInputValue('asunto');
            const description = interaction.fields.getTextInputValue('descripcion');

            await interaction.deferReply({ ephemeral: true });

            const catInfo = readCategory(categoryUid);
            if(typeof catInfo == 'undefined') {
                return interaction.editReply({ content: 'No se pudo crear el ticket porque esta categoría no existe!' });
            }

            const total_open = countOpenTicketsByUser(guildId, catInfo.category, userId);
            if(total_open >= catInfo.limit_tickets) {
                return interaction.editReply({ content: '🎫 No puedes crear un ticket nuevo porque has alcanzado el límite de tickets abiertos en esta categoría' });
            }

            var channelPermissions = [
                { id: interaction.member.guild.roles.everyone.id, deny: [ 'ViewChannel', 'ReadMessageHistory' ] },
                { id: clientId, allow: [ 'ViewChannel', 'ReadMessageHistory', 'SendMessages', 'ManageChannels', 'ManageMessages', 'ManageRoles' ] },
                { id: userId, allow: [ 'ViewChannel', 'ReadMessageHistory', 'SendMessages' ] },
            ];

            if(typeof staffRole != 'undefined' && staffRole.length > 0 ) {
                channelPermissions.push({ id: staffRole, allow: [ 'ViewChannel', 'ReadMessageHistory', 'SendMessages' ] });
            }

            const newTicketId = generateTicketId(guildId, catInfo.category);

            const channelParams = {
                name: `ticket-${newTicketId}`,
                type: ChannelType.GuildText,
                parent: catInfo.category,
                permissionOverwrites: channelPermissions
            };

            interaction.guild.channels.create(channelParams).then(async (newChannel) => {
                createNewTicket(newTicketId, guildId, catInfo.category, newChannel.id, userId, subject, description);

                interaction.editReply({ content: `🎫 Tu ticket se ha creado, para ir a este haz clic aquí: <#${newChannel.id}>` });

                const embed_welcome = {
                    color: parseInt(template.new.color, 16),
                    title: template.new.title.replaceAll('{catname_mention}', catInfo.name),
                    description: template.new.description
                        .replaceAll('{user_tag}', userTag)
                        .replaceAll('{catname_mention}', catInfo.name)
                        .replaceAll('{subject}', subject)
                        .replaceAll('{description}', description),
                    footer: footer
                };

                const btns_ticket = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`closeTicket;${newChannel.id}`).setLabel('Cerrar Ticket').setStyle(ButtonStyle.Danger),
                );

                newChannel.send({ content: template.new.message.replaceAll('{user}', `<@${userId}>`), embeds: [ embed_welcome ], components: [ btns_ticket ] });
            }).catch((error) => {
                console.error(color.red('[interaction:modals:openticketmodal:createchannel]'), error.message);
                interaction.editReply({ content: 'Ocurrió un error al crear el canal del ticket.' });
            });
        } catch(error) {
            console.error(color.red('[interaction:modals:openticketmodal]'), error);
        }
    }
};
