/**
 * Helper reusable para armar "embeds" con el sistema Components V2 de Discord.
 *
 * Reemplaza al patrón clásico EmbedBuilder + ActionRowBuilder (botones debajo)
 * por un ContainerBuilder con borde de color (como los embeds de toda la vida)
 * y, si se pasa un botón, un SectionBuilder que lo pone como "accessory" —
 * pegado al texto, no en una fila aparte.
 *
 * Requisitos:
 * - discord.js >= 14.19 (ahí se agregaron ContainerBuilder/SectionBuilder).
 * - El mensaje que use el resultado debe enviarse con
 *   flags: MessageFlags.IsComponentsV2 (se puede combinar con Ephemeral vía OR).
 * - No se puede mezclar con `embeds` ni `content` en el mismo mensaje.
 * - Un botón sin premium necesita label y/o emoji, si no tira RangeError.
 *
 * Uso:
 *   const { MessageFlags, ButtonBuilder, ButtonStyle } = require('discord.js');
 *   const { buildV2Embed } = require('#functions/embedV2.js');
 *
 *   const button = new ButtonBuilder()
 *       .setCustomId('mi_boton')
 *       .setLabel('🚀 Continuar')
 *       .setStyle(ButtonStyle.Success);
 *
 *   const container = buildV2Embed({
 *       title: '📋 Título',
 *       description: 'Descripción del mensaje...',
 *       footer: 'Texto chico al pie',
 *       color: 0x00AE86,
 *       button // opcional
 *   });
 *
 *   await channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] });
 *   // o en una interacción:
 *   await interaction.reply({ flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral, components: [container] });
 */
const { ContainerBuilder, SectionBuilder } = require('discord.js');

function buildV2Embed({ title, description, footer, color, button }) {
    let content = '';
    if (title) content += `## ${title}\n\n`;
    content += description;
    if (footer) content += `\n\n-# ${footer}`; // "-# " = subtext de Discord, imita el footer chico del embed clásico

    const container = new ContainerBuilder().setAccentColor(color);

    if (button) {
        const section = new SectionBuilder()
            .addTextDisplayComponents(textDisplay => textDisplay.setContent(content))
            .setButtonAccessory(button);

        return container.addSectionComponents(section);
    }

    return container.addTextDisplayComponents(textDisplay => textDisplay.setContent(content));
}

module.exports = { buildV2Embed };
