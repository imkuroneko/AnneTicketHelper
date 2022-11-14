// Load required resources =================================================================================================
const path = require('path');

// Load configuration files ================================================================================================
const { ownerId } = require(path.resolve('./config/bot.json'))

// Module script ===========================================================================================================
exports.run = (client, message, args) => {
    try {
        message.delete();

        if(message.author.id != ownerId) { return false; }

        const placeholder = [{
            color: 0xcc3366,
            title: '🐈 placeholder 🐈',
            description: 'Embed placeholder para el sistema de monitorero de servidor de FiveM... En breve recibirás el ID de este mensaje para guardarlo en tu config.',
        }];

        message.channel.send({ embeds: placeholder }).then((msg) => {
            const placeholder = [{ color: 0xcc3366, title: '🐈 placeholder 🐈', description: 'El ID de este mensaje es: `'+msg.id+'`' }];
            msg.edit({ embeds: placeholder });
        });
    } catch(error) {
        console.error('createFivemEmbed::main', error);
    }
}