// Load required resources =================================================================================================
const { Events } = require('discord.js');
const path = require('path');

// Load configuration files ================================================================================================
const channels = require(path.resolve('./config/join_left.json'));
const config = require(path.resolve('./config/bot.json'));

// Module script ===========================================================================================================
module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        try {

            if(member.user.id == config.clientId) { return; }

            var user     = member.user.tag;
            var userId   = member.user.id;
            var username = member.user.username;
            var avatar   = member.user.displayAvatarURL();

            if(channels.log_JoinLeft.length > 0) {
                const sender_log = member.guild.channels.cache.get(channels.log_JoinLeft);
                sender_log.send({ embeds: [{
                    color: 0xe35d5d,
                    title: `👋🏻 Un usuario se acaba de ir del servidor`,
                    fields: [ { name: 'Usuario', value: user }, { name: 'User ID', value: userId } ],
                    // thumbnail: { url: avatar },
                }] });
            }
        } catch(error) {
            console.error('event:clientMemberRemove |', error.message);
        }
    }
};