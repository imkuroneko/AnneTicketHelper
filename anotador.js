botones     ::  client.interactionsButtons
slash       ::  client.interactionsSlash
selectMenu  ::  client.interactionsSelectMenu

----------------------------------------------------------------

var menu_id = interaction.values[0];
        
var category_info = Object.values(config.guilds[guild]).flat().find(r => r.id === menu_id);
const total_open = sqlite.countOpenTicketsByUser(user, guild, menu_id);

const embed_content = [{
    color: template.main_embed.color,
    title: template.main_embed.title,
    description: template.main_embed.description
}];

await interaction.deferUpdate();

await wait(750);

await interaction.editReply({ embeds: embed_content, ephemeral: true });

if(total_open >= category_info.limit) {
    console.log(`[🎫] Intento fallido de crear ticket | Categoria: ${category_info.name}`);
    return await interaction.followUp({
        content: "🎫 No se puede crear el ticket porque has alcanzado el límite de tickets abiertos en esta categoría...",
        ephemeral: true
    });
}

await interaction.followUp({
    content: "🎫 El ticket está siendo creado...",
    ephemeral: true
});

var permissions = [
    { id: interaction.member.guild.roles.everyone.id, deny: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY' ] },
    { id: config.bot.clientId, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'MANAGE_ROLES' ] },
    { id: user, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES' ] }
];

if(category_info.allowed_staff.length > 0) {
    category_info.allowed_staff.forEach(staff => {
        permissions.push({ id: staff, allow: [ 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES' ] });
    });
}

const newTicketId = sqlite.generateTicketId(guild, menu_id);

interaction.guild.channels.create(`ticket-${newTicketId}`, {
    type: 'text',
    parent: category_info.id,
    permissionOverwrites: permissions
}).then((newChannel) => {
    sqlite.createNewTicket(guild, category_info.id, newChannel.id, user);

    interaction.followUp({
        content: `🎫 Tu ticket se ha creado: <#${newChannel.id}>`,
        ephemeral: true
    });

    const embed_welcome = [{
        color: template.new.color,
        title: template.new.title.replaceAll('{catname_mention}', category_info.name),
        description: template.new.description.replaceAll('{prefix_mention}', config.bot.prefix),
        footer: footer
    }];

    const btns_ticket = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`${newChannel.id}-close`).setLabel('Cerrar Ticket').setStyle(ButtonStyle.Danger),
    );

    newChannel.send({ content: `Hola <@${user}>!`, embeds: embed_welcome, components: [ btns_ticket ] });

    console.log(`[🎫] Nuevo Ticket Creado | Categoria: ${category_info.name} | ID: ${newTicketId}`);
}).catch((error) => {
    console.log(error);
});
