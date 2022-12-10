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

// [1] Admin Commands (with prefix) ========================================================================================
try {
    var pathFiles = './commands';
    client.commandsPrefix = new Collection();
    const prefixCommandFiles = fs.readdirSync(path.resolve(pathFiles)).filter(file => file.endsWith(".js"));
    for(const prefixFile of prefixCommandFiles) {
        client.commandsPrefix.set(prefixFile.split(".")[0], require(path.resolve(path.join(pathFiles, prefixFile))));
    }
} catch(error) {
    console.error(color.red('[load:cmds]'), error.message);
}

// [2] Interactions :: SlashCommands =======================================================================================
client.interactionsSlash = new Collection();
try {
    var pathFiles = './interactions/slashCommands';
    client.slashRegister = [];
    const slashCommandFiles = fs.readdirSync(path.resolve(pathFiles)).filter(file => file.endsWith('.js'));
    for(const slashFile of slashCommandFiles) {
        var command = require(path.resolve(path.join(pathFiles, slashFile)));
        client.slashRegister.push(command.data.toJSON());
        client.interactionsSlash.set(command.data.name, command);
    }
} catch(error) {
    console.log(error);
    console.error(color.red('[load:cmds:slash]'), error.message);
}

// [3] Interactions :: Buttons =============================================================================================
try {
    var pathFiles = './interactions/buttons';
    client.interactionsButtons = new Collection();
    const interactionsFiles = fs.readdirSync(path.resolve(pathFiles)).filter(file => file.endsWith('.js'));
    for(const interactionFile of interactionsFiles) {
        client.interactionsButtons.set(interactionFile.split(".")[0], require(path.resolve(path.join(pathFiles, interactionFile))));
    }
} catch(error) {
    console.error(color.red('[load:interactions]'), error.message);
}


// [4] Interactions :: Menus ===============================================================================================
try {
    var pathFiles = './interactions/selectMenu';
    client.interactionsSelectMenu = new Collection();
    const interactionsFiles = fs.readdirSync(path.resolve(pathFiles)).filter(file => file.endsWith('.js'));
    for(const interactionFile of interactionsFiles) {
        client.interactionsSelectMenu.set(interactionFile.split(".")[0], require(path.resolve(path.join(pathFiles, interactionFile))));
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