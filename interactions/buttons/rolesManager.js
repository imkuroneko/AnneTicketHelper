module.exports = {
    name: 'rolesManager',
    async execute(interaction) {
        const data = interaction.customId.split(';');
        const roleId = data[1];
        const interact_user = interaction.guild.members.cache.get(interaction.user.id);

        if(!interaction.member.roles.cache.some(r => r.id === roleId)) {
            interact_user.roles.add(roleId);
            return interaction.reply({ content: `✔ Se te ha otorgado el rol de <@&${roleId}>.`, ephemeral: true });
        } else {
            return interaction.reply({ content: `❌ Ya cuentas con el rol de <@&${roleId}>.`, ephemeral: true });
        }
    }
};
