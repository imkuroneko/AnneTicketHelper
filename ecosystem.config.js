module.exports = {
    apps : [{
        name : "FiveM HelperBot",
        script : "./index.js",

        watch : true,
        max_restarts : 10,

        // Ficheros a ignorar (para evitar el bot se reinicie cuando estos ficheros sean modificados)
        ignore_watch : [
            './data/db.sqlite',
            './logs/errors.log',
            './logs/out.log'
        ],

        log_date_format : 'YYYY-MM-DD HH:mm',
        error_file : './logs/errors.log',
        out_file   : './logs/out.log'
    }]
}
