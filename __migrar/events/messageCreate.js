// Data
const config = require('../data/config.json');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        try {
            // 🚨 Ignore bots
            if(message.author.bot) { return; }

            // 🚨 Ignore when not prefix
            if(message.content.indexOf(config.bot.prefix) !== 0) {
                return;
            }

            // 🥞 Split content
            const args = message.content.slice(config.bot.prefix.length).trim().split(/ +/g);
            const command = args.shift().toLowerCase();

            // 🔍 Search command
            const cmd = message.client.commandsPrefix.get(command);

            if(!cmd) { return; }

            cmd.run(message.client, message, args);
        } catch (error) {
            console.error('messageCreate', error);
        }
    }
}