// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const { SlashCommandBuilder, ModalBuilder, ChannelType, TextInputStyle, StringSelectMenuOptionBuilder, MessageFlags } = require('discord.js');

// Load Functions ==========================================================================================================
const { truncate } = require('#functions/helpers.js');
const { listCategoriesByGuild } = require('#functions/sqlite.js');

// Module script ===========================================================================================================
module.exports = {
    data: new SlashCommandBuilder()
        .setName('categorias')
        .setDescription('Gestionar las categorías de tickets')
        .setDMPermission(false)

        // Comando de listar
        .addSubcommand((subcommand) =>
            subcommand
                .setName('listar')
                .setDescription('Listar categorías existentes')
        )

        // Comando de crear
        .addSubcommand((subcommand) =>
            subcommand
                .setName('crear')
                .setDescription('Crear una categoría de ticket')
        )

        // Comando de eliminar
        .addSubcommand((subcommand) =>
            subcommand
                .setName('eliminar')
                .setDescription('Eliminar una categoría de ticket')
        ),
    async execute(interaction) {
        try {
            const cmd = interaction.options.getSubcommand();

            // listar categorias
            if(cmd == 'listar') {
                const categorias = listCategoriesByGuild(interaction.guildId);

                var fields = [];
                categorias.forEach((cat) => {
                    fields.push({
                        name: `**Categoría:** ${cat.name} (\`${cat.uid}\`)`,
                        value: "```yaml\nLimite tickets abiertos: "+cat.limit_tickets+"\nDescripcion: "+cat.description+"```"
                    });
                });

                return interaction.reply({ embeds: [{ color: 0x4f30b3, title: '🎫 Categorías Disponibles', fields: fields }] });
            }

            // creacion de categorias
            if(cmd == 'crear') {
                const modal = new ModalBuilder()
                    .setCustomId('categoriaCrear')
                    .setTitle('Crear Categoría');

                modal.addLabelComponents(
                    label => label
                        .setLabel('Nombre')
                        .setTextInputComponent(input => input
                            .setCustomId('nombre')
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(5)
                            .setMaxLength(35)
                            .setRequired(true)
                        ),
                    label => label
                        .setLabel('Descripción')
                        .setTextInputComponent(input => input
                            .setCustomId('descripcion')
                            .setStyle(TextInputStyle.Paragraph)
                            .setMinLength(10)
                            .setMaxLength(300)
                            .setRequired(true)
                        ),
                    label => label
                        .setLabel('Emoji (utilizar emojis neutrales)')
                        .setTextInputComponent(input => input
                            .setCustomId('emoji')
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(35)
                            .setRequired(true)
                        ),
                    label => label
                        .setLabel('Límite de tickets simultáneos por usuario')
                        .setTextInputComponent(input => input
                            .setCustomId('limite')
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(3)
                            .setRequired(true)
                        ),
                    label => label
                        .setLabel('Categoría de Discord (canal padre)')
                        .setChannelSelectMenuComponent(select => select
                            .setCustomId('categoria')
                            .addChannelTypes(ChannelType.GuildCategory)
                        )
                );

                return await interaction.showModal(modal);
            }

            // eliminar categoria
            if(cmd == 'eliminar') {
                const categorias = listCategoriesByGuild(interaction.guildId);

                if(categorias.length === 0) {
                    return interaction.reply({ content: 'No hay categorías registradas en este servidor.', flags: MessageFlags.Ephemeral });
                }

                var options = [];
                categorias.forEach((cat) => {
                    var emoji;
                    try {
                        emoji = JSON.parse(cat.emoji);
                    } catch(error) {
                        console.error(color.red('[interaction:slashcmd:categorias]'), `Emoji inválido en categoría ${cat.uid} (${cat.name}), se omite: ${error.message}`);
                        return;
                    }

                    options.push(new StringSelectMenuOptionBuilder().setLabel(cat.name).setValue(cat.uid).setEmoji(emoji).setDescription(truncate(cat.description, 100)));
                });

                if(options.length === 0) {
                    return interaction.reply({ content: 'Ninguna categoría tiene datos válidos para mostrar.', flags: MessageFlags.Ephemeral });
                }

                // Los select menu de Discord admiten un máximo de 25 opciones
                if(options.length > 25) { options = options.slice(0, 25); }

                const modal = new ModalBuilder()
                    .setCustomId('categoriaEliminar')
                    .setTitle('Eliminar Categoría');

                modal.addLabelComponents(
                    label => label
                        .setLabel('Categoría a eliminar')
                        .setStringSelectMenuComponent(select => select
                            .setCustomId('categoria')
                            .setMinValues(1)
                            .setMaxValues(1)
                            .addOptions(options)
                        )
                );

                return await interaction.showModal(modal);
            }

            return interaction.reply({ content: '🦄 **eep!** opción de acción no válida', flags: MessageFlags.Ephemeral });
        } catch(error) {
            console.error(color.red('[interaction:slashcmd:categorias]'), error.message);
        }
    }
};
