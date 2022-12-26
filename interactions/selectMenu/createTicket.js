// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { ChannelType, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const path = require('path');
const wait = require('node:timers/promises').setTimeout;

// Load configuration files ================================================================================================
const { clientId, staffRole } = require(path.resolve('./config/params.json'));
const { template, footer } = require(path.resolve('./data/embeds.json'));

// Load SQLite Helper ======================================================================================================
const sqlite = require(path.resolve('./functions/sqlite.js'));

// Module script ===========================================================================================================
module.exports = {
    name: 'createTicket',
    async execute(interaction) {
        try {
            const userId   = interaction.user.id;
            const guildId  = interaction.guildId;
            const optionId = (interaction.values[0]).replace('createTicket;', '');

            await interaction.deferUpdate();
            await wait(350);
            await interaction.editReply({ content: '', ephemeral: true });
            await wait(250);

            const catInfo = await sqlite.readCategory(optionId);
            if(typeof catInfo == 'undefined') {
                return await interaction.followUp({
                    content: 'No se pudo crear el ticket porque esta categoría no existe!',
                    ephemeral: true
                });
            }

            const total_open = await sqlite.countOpenTicketsByUser(guildId, catInfo.category, userId);
            if(total_open >= catInfo.limit_tickets) {
                return await interaction.followUp({
                    content: '🎫 No puedes crear un ticket nuevo porque has alcanzado el límite de tickets abiertos en esta categoría',
                    ephemeral: true
                });
            }

            var channelPermissions = [
                { id: interaction.member.guild.roles.everyone.id, deny: [ 'ViewChannel', 'ReadMessageHistory' ] },
                { id: clientId, allow: [ 'ViewChannel', 'ReadMessageHistory', 'SendMessages', 'ManageChannels', 'ManageMessages', 'ManageRoles' ] },
                { id: userId, allow: [ 'ViewChannel', 'ReadMessageHistory', 'SendMessages' ] },
            ];

            if(typeof staffRole != 'undefined' && staffRole.length > 0 ) {
                channelPermissions.push({ id: staffRole, allow: [ 'ViewChannel', 'ReadMessageHistory', 'SendMessages' ] });
            }

            const newTicketId = await sqlite.generateTicketId(guildId, catInfo.category);

            const channelParams = {
                name: `ticket-${newTicketId}`,
                type: ChannelType.GuildText,
                parent: catInfo.category,
                permissionOverwrites: channelPermissions
            };

            interaction.guild.channels.create(channelParams).then(async (newChannel) => {
                await sqlite.createNewTicket(newTicketId, guildId, catInfo.category, newChannel.id, userId);

                interaction.followUp({ content: `🎫 Tu ticket se ha creado, para ir a este haz clic aquí: <#${newChannel.id}>`, ephemeral: true });

                const embed_welcome = {
                    color: parseInt(template.new.color, 16),
                    title: template.new.title.replaceAll('{catname_mention}', catInfo.name),
                    description: template.new.description,
                    footer: footer
                };

                const btns_ticket = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`closeTicket;${newChannel.id}`).setLabel('Cerrar Ticket').setStyle(ButtonStyle.Danger),
                );

                newChannel.send({ content: `Hola <@${userId}>!`, embeds: [ embed_welcome ], components: [ btns_ticket ] });
            }).catch((error) => {
                console.error(color.red('[interaction:selectmenu:createticket:createticket]'), error.message);
            });
        } catch(error) {
            console.error(color.red('[interaction:selectmenu:createticket]'), error);
        }
    }
};
