// Data
const config = require('../data/config.json');
const emb = require('../data/embeds.json');

exports.run = (client, message, args) => {
    try {
        message.delete();

        const embed_content = [{
            color: 0xcc3366,
            title: '🎫 RemTicketHelper 🌸',
            description: 'Prefix base para los comandos: `'+config.bot.prefix+'`',
            fields: [
                { name: `**${config.bot.prefix} about**`, value: 'Acerca de este proyecto' },
                { name: `**${config.bot.prefix} adduser [id]**`, value: 'Agregar a un usuario a un ticket' },
                { name: `**${config.bot.prefix} close**`, value: 'Cerrar el ticket' },
                { name: `**${config.bot.prefix} commands**`, value: 'Ver la lista de comandos' },
                { name: `**${config.bot.prefix} delete**`, value: 'Eliminar el ticket' },
                { name: `**${config.bot.prefix} bot**`, value: 'Ver el estado del servidor del bot y el uptime del proceso de RemTicketHelper' },
                { name: `**${config.bot.prefix} removeuser [id]**`, value: 'Eliminar a un usuario de un ticket' },
                { name: `**${config.bot.prefix} reopen**`, value: 'Reabrir un ticket' },
                { name: `**${config.bot.prefix} sendembed**`, value: 'Enviar en este canal la lista de categorías disponibles' }
            ],
            footer: emb.footer
        }];

        message.channel.send({ embeds: embed_content });
    } catch(error) {
        console.error('viewCommands::main', error);
    }
}
