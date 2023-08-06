// Load configuration files ================================================================================================
var idx=256, hex=[], size=256, buf;
while (idx--) hex[idx] = (idx + 256).toString(16).substring(1);

// Functions Export ========================================================================================================
module.exports = {
    duration: (duration, useMilli = false) => {
        let r = duration;
        let d = Math.floor(r / (1000 * 60 * 60 * 24));
        r = r % (1000 * 60 * 60 * 24);
        let h = Math.floor(r / (1000 * 60 * 60));
        r = r % (1000 * 60 * 60);
        let m = Math.floor(r / (1000 * 60));
        r = r % (1000 * 60);
        let s = Math.floor(r / (1000));
        r = r % (1000);
        let ms = r;
        let time = { d, h, m, s, ms };
        let parts = []

        if(time.d) { parts.push(time.d + ' Día'+(time.d !== 1 ? 's' : '')); }
        if(time.h) { parts.push(time.h + ' Hora'+(time.h !== 1 ? 's' : '')); }
        if(time.m) { parts.push(time.m + ' Minuto'+(time.m !== 1 ? 's' : '')); }
        if(time.s) { parts.push(time.s + ' Segundo'+(time.s !== 1 ? 's' : '')); }
        if(useMilli && time.ms) { parts.push(time.ms + ' ms'); }

        if(parts.length === 0) {
            return [ 'recientemente' ]
        } else {
            return parts.map(i=>i).join(", ")
        }
    },

    formatNumber: function(val) {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },

    hasUnicodeEmojis: function(val) {
        const pattern = /\p{Extended_Pictographic}/u;
        const emojis = pattern.test(val);
        return emojis;
    },

    hasDiscordEmojis: function(val) {
        const pattern = /<:.+?:\d+>/g;
        const emojis = pattern.test(val);
        return emojis;
    },

    getFirstUnicodeEmoji: function(val) {
        const pattern = /\p{Extended_Pictographic}/u;
        const emojis = val.match(pattern);
        return (emojis && emojis.length > 0) ? emojis[0] : undefined;
    },

    getFirstDiscordEmoji: function(val) {
        const pattern = /<:.+?:\d+>/g;
        const emojis = val.match(pattern);
        return (emojis.length > 0) ? emojis[0] : undefined;
    },

    uid: function(len) {
        var i = 0;
        var tmp = (len || 11);
        if(!buf || ((idx + tmp) > size*2)) {
            for(buf = '', idx = 0; i < size; i++) {
                buf += hex[Math.random() * 256 | 0];
            }
        }
        return buf.substring(idx, idx++ + tmp);
    },

    validateHexColor: function(color) {
        var reg=/^([0-9a-f]{3}){1,2}$/i;
        return reg.test(color);
    },
};
