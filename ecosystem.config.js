const package = require('./package.json');

module.exports = {
    apps : [{
        name : package.name,
        version: package.version,
        script : "./src/index.js",

        watch : true,
        max_restarts : 10,

        // Ficheros a ignorar (para evitar el bot se reinicie cuando estos ficheros sean modificados)
        ignore_watch : [
            './config/*',
            './data/*',
            './logs/*',
        ],

        log_date_format : 'YYYY-MM-DD HH:mm',
        error_file : './logs/errors.log',
        out_file   : './logs/out.log'
    }]
}