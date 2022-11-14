// Load configuration files ================================================================================================
const { token } = require('./config/bot.json');

// Load required resources =================================================================================================
const fs = require('fs');
const { Client, GatewayIntentBits, Partials, Collection, SlashCommandBuilder } = require('discord.js');

// Define client Intents ===================================================================================================
const client = new Client({
    intents: [
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.User
    ]
});

// Load slash commands =====================================================================================================
client.commandsSlash = new Collection();
try {
    client.slashRegister = [];
    const slashCommandFiles = fs.readdirSync('./commands/slash').filter(file => file.endsWith('.js'));
    for(const slashFile of slashCommandFiles) {
        var commandName = slashFile.split(".")[0];
        var command = require(`./commands/slash/${slashFile}`);

        client.slashRegister.push(command.data.toJSON());
        client.commandsSlash.set(command.data.name, command);
    }
} catch(error) {
    console.error('load:cmds:slash |', error.message);
}
// Admin Commands (with prefix) ============================================================================================
try {
    client.commandsPrefix = new Collection();
    const prefixCommandFiles = fs.readdirSync('./commands/prefix').filter(file => file.endsWith(".js"));
    for(const prefixFile of prefixCommandFiles) {
        var commandName = prefixFile.split(".")[0];
        var command = require(`./commands/prefix/${prefixFile}`);
        client.commandsPrefix.set(commandName, command);
    }
} catch(error) {
    console.error('load:cmds:prefix |', error.message);
}

// Handle :: Interactions ==================================================================================================
try {
    client.interactions = new Collection();
    const interactionsFiles = fs.readdirSync('./interactions').filter(file => file.endsWith('.js'));
    for(const interactionFile of interactionsFiles) {
        var commandName = interactionFile.split(".")[0];
        var command = require(`./interactions/${interactionFile}`);
        client.interactions.set(commandName, command);
    }
} catch(error) {
    console.error('load:interactions |', error.message);
}

// Handle :: Events ========================================================================================================
try {
    const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
    for(const file of events) {
        const event = require(`./events/${file}`);
        client.on(event.name, (...args) => event.execute(...args));
    }
} catch(error) {
    console.error('load:events |', error.message);
}

// Define token a init bot =================================================================================================
client.login(token).catch((error) => {
    console.error('client:token |', error.message);
});

// Handle Error ============================================================================================================
process.on('unhandledRejection', (error) => {
    console.error('process:unhandledError |', error.message);
});

client.on('shardError', (error) => {
    console.error('process:shardError |', error.message);
});