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

};
