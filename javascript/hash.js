var hash = (function(window){
    'use strict';

    var Hash = function() {
        window.addEventListener('hashchange', this.onChange.bind(this));
        this.hashes = {};
        this.parse();
    };

    Hash.prototype.get = function(name, def) {
        if (this.hashes.hasOwnProperty(name)) {
            return this.hashes[name];
        }
        return def || false;
    };

    Hash.prototype.set = function(name, value) {
        this.hashes[name] = value;
        this.update();
        return this;
    };

    Hash.prototype.parse = function() {
        var hashes = location.href.split('#');
        var buffer = null;

        if (hashes.length < 1 && hashes[1].length < 1) return false;
        for (var i = 1, c = hashes.length; i < c; i++) {
            buffer = hashes[i].split('=');
            this.hashes[buffer[0]] = buffer[1];
        }

        return this;
    };

    Hash.prototype.update = function() {
        location.assign(location.origin + location.pathname + this.format());
        return this;
    };

    Hash.prototype.format = function() {
        var result = '';

        for (var key in this.hashes) {
            result += '#' + key + '=' + this.hashes[key];
        }

        return result;
    };

    Hash.prototype.onChange = function(event) {
        this.parse();
    };

    return new Hash();
})(this);
