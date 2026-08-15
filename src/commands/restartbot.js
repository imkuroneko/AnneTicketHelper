// Load required resources =================================================================================================
const { color } = require('console-log-colors');
const path = require('path');

// Load configuration files ================================================================================================
const { ownerId } = require('../config/params.json');

// Module script ===========================================================================================================
exports.run = (client, message, args) => {
    try {
        if(message.author.id != ownerId) { return; }

        message.reply('🦄 Reiniciando bot~');

        setTimeout(() => {
            process.exit();
        }, 2500);
    } catch(error) {
        console.error(color.red('[cmdPrefix:restartbot]'), error.message);
    }
}