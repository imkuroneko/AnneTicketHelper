// Custom functions 💜
const { removeUserFromTickets } = require('../functions/sqlite.js');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        try {
            const userId = member.user.id;

            removeUserFromTickets(userId);
        } catch (error) {
            console.error('guildMemberRemove::main', error);
        }
    }
}
