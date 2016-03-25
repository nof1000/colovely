window.util = (function(window){
    'use strict';

    function anim(options, callback) {
        var properties = {};
        var start = performance.now();
        var isEnd = false;

        options = options || {};
        options['duration'] = options['duration'] || 1000;
        options['values'] = options['values'] || {};

        if (options['from'] && options['to']) {
            options['values']['default'] = [
                options['from'],
                options['to']
            ];
        }

        requestAnimationFrame(function frame(time){
            var fraction = (time - start) / options.duration;
            var value = 0;
            if (fraction > 1) {
                fraction = 1;
                isEnd = true;
            }

            value = Math.pow(fraction, 2);
            for (var prop in options['values']) {
                properties[prop] = options['values'][prop][0] + (value * (options['values'][prop][1] - options['values'][prop][0]));
            }

            callback(properties, isEnd);

            if (fraction < 1) requestAnimationFrame(frame);
        });
    }

    function frand(min, max) {
        return (min + (Math.random() * max + 1 - min));
    }

    function rand(min, max) {
        return frand(min, max) ^ 0;
    }

    function byte(val) {
        if (val <= 0xf) return '0' + val.toString(16);
        return val.toString(16);
    }

    return {
        anim: anim,
        frand: frand,
        rand: rand,
        byte: byte,
    }
})(this);
