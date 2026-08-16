/**
 * Helper reusable para armar "embeds" con el sistema Components V2 de Discord.
 *
 * Reemplaza al patrón clásico EmbedBuilder + ActionRowBuilder por un
 * ContainerBuilder con borde de color (como los embeds de toda la vida) con
 * el texto arriba y, si se pasan botones, una fila de botones debajo —
 * mismo layout visual que un embed clásico con components debajo.
 *
 * Requisitos:
 * - discord.js >= 14.19 (ahí se agregó ContainerBuilder).
 * - El mensaje que use el resultado debe enviarse con
 *   flags: MessageFlags.IsComponentsV2 (se puede combinar con Ephemeral vía OR).
 * - No se puede mezclar con `embeds` ni `content` en el mismo mensaje.
 * - Un botón sin premium necesita label y/o emoji, si no tira RangeError.
 * - Máximo 5 botones por fila (límite de Discord para ActionRow).
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
 *       button // opcional: un ButtonBuilder o un array de hasta 5
 *   });
 *
 *   await channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] });
 *   // o en una interacción:
 *   await interaction.reply({ flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral, components: [container] });
 */
const { ContainerBuilder } = require('discord.js');

function buildV2Embed({ title, description, footer, color, button }) {
    let content = '';
    if (title) content += `## ${title}\n\n`;
    content += description;
    if (footer) content += `\n\n-# ${footer}`; // "-# " = subtext de Discord, imita el footer chico del embed clásico

    const container = new ContainerBuilder()
        .setAccentColor(color)
        .addTextDisplayComponents(textDisplay => textDisplay.setContent(content));

    if (button) {
        const buttons = Array.isArray(button) ? button : [button];
        container.addActionRowComponents(row => row.addComponents(...buttons));
    }

    return container;
}

module.exports = { buildV2Embed };
