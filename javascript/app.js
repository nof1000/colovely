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

var colorStore = (function(window){
    'use strict';

    var ColorStore = function() {
        this.elements = [];

        this.position = 0;
        this.maxCount = 150;
        this.count = 0;
    };

    ColorStore.prototype.init = function(elem) {
        for (var i = 0; i < this.maxCount; i++) {
            this.elements.push(document.createElement('a'));
            this.elements[i].addEventListener('mouseup', this.onClick.bind(this));
            this.elements[i].setAttribute('data-index', i);
            this.elements[i].className = 'hide';
            elem.appendChild(this.elements[i]);
        }
    };

    ColorStore.prototype.add = function(hex) {
        if (this.position > 0) this.elements[this.position].className = '';
        if (this.position == this.count) this.count++;

        if (this.count > this.maxCount - 1) {
            this.position = 0;
            this.count = this.maxCount - 1;
        }

        this.elements[this.position % this.count + 1].className = 'focus';
        this.setColor(this.position % this.count + 1, hex);
        this.position++;
    };

    ColorStore.prototype.getColor = function(index) {
        return this.elements[index].getAttribute('data-color');
    };

    ColorStore.prototype.setColor = function(index, hex) {
        this.elements[index].setAttribute('data-color', hex);
        this.elements[index].style.background = '#' + hex;
        this.elements[index].href = '#hex=' + hex;
    };

    ColorStore.prototype.setFocus = function(index) {
        index = this._pos(index);
        this.elements[this.position].className = '';
        this.elements[index].className = 'focus';
        this.position = index

        app.changeColor(color.HEXTORGB(this.getColor(index)));
        hash.set('hex', this.getColor(index));
    };

    ColorStore.prototype._pos = function(index) {
        if ((index > this.count)) return 1;
        else if (index < 1) return this.count;
        return index;
    };

    ColorStore.prototype.onClick = function(event) {
        var elem = event.target || event.srcElement;
        this.setFocus(+elem.getAttribute('data-index'));
    };

    return new ColorStore();
})(this);

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

window.color = (function(window){
    'use strict';

    var regHSL = /^hsl\(( ?[\d]{1,3}\, ?[\d]{1,3}\%\, ?[\d]{1,3}\%)\)/i;
    var regHEX = /\#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})/i;
    var regRGB = /^rgb\(( ?[\d]{1,3}\, ?[\d]{1,3}\, ?[\d]{1,3})\)/i;

    function HUE2RGB (p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    var Color = function(options) {
        options = options || {};
        this.r = 0;
        this.g = 0;
        this.b = 0;
    };

    Color.prototype.rgb = function(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    };

    Color.prototype.hsl = function(h, s, l) {
        var r, g, b;
        if (s != 0) {
            var q = (1 < 0.5) ? (1 * (1 + s)) : (1 + s - 1 * s);
            var p = 2 * 1 - q;
            this.rgb(
                Math.round(HUE2RGB(p, q, h + 1 / 3) * 255),
                Math.round(HUE2RGB(p, q, h) * 255),
                Math.round(HUE2RGB(p, q, h - 1 / 3) * 255)
            );
        } else this.rgb(255, 255, 255);
    };

    Color.prototype.fromHSL = function(str) {
        if (!regHSL.test(str)) return false;
        str = val.match(regHSL);
        this.hsl(+str[1], +str[2], +str[3]);
    };

    Color.prototype.fromHEX = function(str) {
        var buffer = this.HEXTORGB(str);
        if (buffer) this.rgb(buffer.r, buffer.g, buffer.b);
    };

    Color.prototype.fromRGB = function(val) {
        if (!regRGB.test(val)) return false;
        val = val.match(regRGB);
        this.rgb(+val[1], +val[2], +val[3]);
    };

    Color.prototype.toString = function(val) {
        switch (val) {
            case 'hsl':
                return this.toHSL();
            break;
            case 'hex':
                return this.toHEX();
            break;
            case 'rgb':
            default:
                return this.toRGB();
            break;
        }
    };

    Color.prototype.toHSL = function(val) {
        var r, g, b, h, s, l, min, max;

        r = this.r / 255;
        g = this.g / 255;
        b = this.b / 255;

        min = Math.min(r, g, b);
        max = Math.max(r, g, b);

        l = (max + min) / 2;
        if (max == min) {
            s = 0;
            h = Number.NaN;
        } else {
            if (l < 0.5) s = (max - min) / (max + min);
            else s = (max - min) / (2 - max - min);
        }

        switch (max) {
            case r: h = (g - b) / (max - min); break;
            case g: h = 2 + (b - r) / (max - min); break;
            case b: h = 4 + (r - g) / (max - min); break;
        }

        h *= 60;
        h += (h < 0) ? 360 : 0;

        if (!val) return color.formatHSL(h ^ 0, (s * 100) ^ 0, (l * 100) ^ 0);
        else return { h: (h ^ 0), s: (s * 100) ^ 0, l: (l * 100) ^ 0 };
    };

    Color.prototype.toHEX = function(val) {
        if (!val) return '#' + util.byte(this.r) + util.byte(this.g) + util.byte(this.b);
        else return [util.byte(this.r), util.byte(this.g), util.byte(this.b) ];
    };

    Color.prototype.toRGB = function(val) {
        if (!val) return color.formatRGB(this.r, this.g, this.b);
        else return { r: this.r, g: this.g, b: this.b };
    };

    var color = new Color

    color.HEXTORGB = function(str) {
        if (!regHEX.test(str)) return false;
        str = str.match(regHEX);

        for (var i = 1; i < str.length; i++) {
            if (str[i].length != 2) str[i] += str[i];
        }

        return { r: +('0x' + str[1]), g: +('0x' + str[2]), b: +('0x' + str[3]) };
    };

    color.formatHSL = function(hsl) {
        return 'hsl(' + (hsl.h ^ 0) + ', ' + (hsl.s ^ 0) + '%, ' + (hsl.l ^ 0) + '%)';
    };

    color.formatHEX = function(rgb) {
        return ('#' + util.byte(rgb.r ^ 0) + util.byte(rgb.g ^ 0) + util.byte(rgb.b ^ 0));
    };

    color.formatRGB = function(rgb) {
        return 'rgb(' + (rgb.r ^ 0) + ', ' + (rgb.g ^ 0) + ', ' + (rgb.b ^ 0) + ')';
    };

    color.regHSL = regHSL;
    color.regHEX = regHEX;
    color.regRGB = regRGB;

    return color;
})(this);

var hash = (function(window){
    'use strict';

    var Hash = function() {
        this.hashes = {};

        window.addEventListener('hashchange', this.onChange.bind(this));
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

window.app = (function(window){
    'use strict'

    var App = function() {
        this.elements = null;
        this.touch = null;

        this.init();
        this.addEvents();
    }

    App.prototype.init = function() {
        var hex = hash.get('hex');
        this.elements = {
            madeHeart: $('.heart use'),
            history: $('header .history'),
            made: $('.made a'),
            main: $('main'),
            hsl: $('.hsl'),
            hex: $('.hex'),
            rgb: $('.rgb')
        };

        colorStore.init(this.elements.history);

        if (color.regHEX.test(hex)) {
            this.changeColor(color.HEXTORGB(hex), true);
        }
    };

    App.prototype.addEvents = function() {
        document.addEventListener('keydown', this.onKDown.bind(this));

        document.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchend', this.onTouchEnd.bind(this));

        this.elements.hsl.addEventListener('click', this.onSelection.bind(this));
        this.elements.hex.addEventListener('click', this.onSelection.bind(this));
        this.elements.rgb.addEventListener('click', this.onSelection.bind(this));
    };

    App.prototype.setBackgroundColor = function(rgb) {
        this.elements.main.style.backgroundColor = (
            color.formatRGB(rgb)
        );
    };

    App.prototype.setElementsColor = function(hex) {
        this.elements.made.style.color = hex;
        this.elements.madeHeart.style.stroke = hex;

        this.elements.hsl.style.color = hex;
        this.elements.hex.style.color = hex;
        this.elements.rgb.style.color = hex;
    };

    App.prototype.updateValues = function(rgb) {
        this.elements.hsl.innerHTML = color.formatHSL(rgb);
        this.elements.hex.innerHTML = color.formatHEX(rgb);
        this.elements.rgb.innerHTML = color.formatRGB(rgb);
    };

    App.prototype.changeColor = function(rgb, history) {
        var self = this;
        var vals = [color.toHSL(true), color.toRGB(true)];
        color.rgb(rgb.r, rgb.g, rgb.b);
        vals.push(color.toHSL(true), color.toRGB(true));

        if (vals[2].l < 55) {
            this.setElementsColor('#fff');
            this.elements.made.className = '';
        } else {
            this.setElementsColor('#222');
            this.elements.made.className = 'black';
        }

        tn({
            r: [vals[1].r, vals[3].r],
            g: [vals[1].g, vals[3].g],
            b: [vals[1].b, vals[3].b],
            h: [vals[0].h, vals[2].h],
            s: [vals[0].s, vals[2].s],
            l: [vals[0].l, vals[2].l]
        },{
            duration: 600,
            before: function() {
                hash.set('hex', color.formatHEX(vals[3]).slice(1));
                hash.update();
                if (history) colorStore.add(color.formatHEX(vals[3]).slice(1));
            },
            change: function(val) {
                self.setBackgroundColor(val);
                self.updateValues(val);
            }
        });
    };

    App.prototype.onSelection = function(event) {
        var range;
        if (document.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(event.target);
            selection.addRange(range);
        } else if (window.getSelection) {
            range = document.createRange();
            range.selectNodeContents(event.target);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
        }
    };

    App.prototype.onKDown = function(event) {
        var keyCode = event.keyCode || event.charCode || event.witch;

        event.preventDefault();

        if (keyCode == 32) {
            this.changeColor({
                r: util.rand(0, 255),
                g: util.rand(0, 255),
                b: util.rand(0, 255)
            }, true);
        } else if ((keyCode == 65 || keyCode == 37) || (keyCode == 68 || keyCode == 39)) {
            var pos = (keyCode == 65 || keyCode == 37) ? colorStore.position - 1 : colorStore.position + 1;
            colorStore.setFocus(pos);
        }
    };

    App.prototype.onTouchStart = function(event) {
        this.touch = event.changedTouches[0];
    };

    App.prototype.onTouchEnd = function(event) {
        var result = event.changedTouches[0];
        var xAbs = Math.abs(this.touch.clientX - result.clientX);

        if (xAbs > 80) {
            if (this.touch.clientX > result.clientX) {
                this.changeColor({
                    r: util.rand(0, 255),
                    g: util.rand(0, 255),
                    b: util.rand(0, 255)
                }, true);
            } else {
                colorStore.setFocus(colorStore.position - 1);
            }
        }

    };

    return new App();
})(this);
