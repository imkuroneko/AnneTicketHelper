// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const path = require('path');
const fs = require('fs');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');

// Load configuration files ================================================================================================
const { token } = require(path.resolve('./config/params.json'));

// Define client Intents ===================================================================================================
const client = new Client({
    intents: [
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.GuildMember,
        Partials.User
    ]
});

// Track load time =========================================================================================================
client.startupTime = Date.now();

// Load slash commands =====================================================================================================
client.commandsSlash = new Collection();
try {
    var pathFiles = './commands/slash';
    client.slashRegister = [];
    const slashCommandFiles = fs.readdirSync(path.resolve(pathFiles)).filter(file => file.endsWith('.js'));
    for(const slashFile of slashCommandFiles) {
        var command = require(path.resolve(path.join(pathFiles, slashFile)));
        client.slashRegister.push(command.data.toJSON());
        client.commandsSlash.set(command.data.name, command);
    }
} catch(error) {
    console.error(color.red('[load:cmds:slash]'), error.message);
}
// Admin Commands (with prefix) ============================================================================================
try {
    var pathFiles = './commands/prefix';
    client.commandsPrefix = new Collection();
    const prefixCommandFiles = fs.readdirSync(path.resolve(pathFiles)).filter(file => file.endsWith(".js"));
    for(const prefixFile of prefixCommandFiles) {
        client.commandsPrefix.set(prefixFile.split(".")[0], require(path.resolve(path.join(pathFiles, prefixFile))));
    }
} catch(error) {
    console.error(color.red('[load:cmds:prefix]'), error.message);
}

// Handle :: Interactions ==================================================================================================
try {
    var pathFiles = './interactions';
    client.interactions = new Collection();
    const interactionsFiles = fs.readdirSync(path.resolve(pathFiles)).filter(file => file.endsWith('.js'));
    for(const interactionFile of interactionsFiles) {
        client.interactions.set(interactionFile.split(".")[0], require(path.resolve(path.join(pathFiles, interactionFile))));
    }
} catch(error) {
    console.error(color.red('[load:interactions]'), error.message);
}

// Handle :: Events ========================================================================================================
try {
    var pathFiles = './events';
    const events = fs.readdirSync(path.resolve(pathFiles)).filter(file => file.endsWith('.js'));
    for(const file of events) {
        const event = require(path.resolve(path.join(pathFiles, file)));
        client.on(event.name, (...args) => event.execute(...args));
    }
} catch(error) {
    console.error(color.red('[load:events]'), error.message);
}

// Define token a init bot =================================================================================================
client.login(token).then(() => {
    console.log(color.green('[init]'), 'Bot operativo | Inicializado en', color.magenta(`${Date.now() - client.startupTime}ms`));
}).catch((error) => {
    console.error(color.red('[client:token]'), error.message);
});

// Handle Error ============================================================================================================
process.on('unhandledRejection', (error) => {
    console.error(color.red('[process:unhandledError]'), error.message);
});

client.on('shardError', (error) => {
    console.error(color.red('[process:shardError]'), error.message);
});