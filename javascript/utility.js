window.util = (function(window){
    'use strict';

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

    window.$ = function(query, elem) { return (elem) ? elem.querySelector(query) : document.querySelector(query); }
    window.$$ = function(query, elem) { return (elem) ? elem.querySelectorAll(query) : document.querySelectorAll(query); }
    window.$id = function(id, elem) { return (elem) ? elem.getElementById(id) : document.getElementById(id); }

    return {
        frand: frand,
        rand: rand,
        byte: byte,
    }
})(this);
