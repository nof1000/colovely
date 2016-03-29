(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['tactween'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(root);
    } else {
        root.tn = root.tactween = factory(root);
  }
}(this, function (window) {
    'use strict';

    var isArray = function(arr) {
        return ('isArray' in Array) ?
            Array.isArray(arr)
            :
            (Object.prototype.toString.call(arr) == '[object Array]');
    };

    var now = (function(){
        var offset = Date.now();
        return ('performance' in window) ?
            (function() { return performance.now(); })
            :
            (function() { return Date.now() - offset; });
    })();

    // For cross-runtime (browser, nodejs, etc...);
    var setFrame = window.requestAnimationFrame || function(callback) {
        setTimeout(function() {
            callback(now());
        }, 20);
    };

    var Tactween = function(props, options) {
        props = props || {};
        options = options || {};

        var duration = options.duration || 1000;
        var timing = options.timing || (function(fraction) { return fraction; });
        var frameUID = 0;
        var values = {};
        var value = 0;
        var start = now();

        if (typeof props == 'number') {
            props = { value: [0, props] };
        } else if (isArray(props)) {
            if (!(props.length == 2)) throw 'Array may comprise only two elements.';
            props = { value: props };
        } else if (typeof props != 'object') {
            throw 'Props may comprise only Number, Array or Object.';
        }

        if (options.before) options.before();

        frameUID = setFrame(function frame(time){
            var fraction = (time - start) / duration;
            if (fraction > 1) fraction = 1;

            value = timing(fraction);
            for (var prop in props) {
                values[prop] = props[prop][0] + (
                    value * (props[prop][1] - props[prop][0])
                );
            }

            if (options.change) options.change(values);
            if ((fraction == 1) && options.complete) options.complete(values);
            if (fraction < 1) frameUID = setFrame(frame);
        });

        return { tactween: Tactween, more: Tactween, uid: frameUID };
    };

    return Tactween;
}));
