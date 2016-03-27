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

    Color.prototype.fromHSL = function(val) {
        if (!regHSL.test(val)) return false;
        val = val.match(regHSL);
        this.hsl(+val[1], +val[2], +val[3]);
    };

    Color.prototype.fromHEX = function(val) {
        if (!regHEX.test(val)) return false;
        val = val.match(regHEX);

        for (var i = 1; i < val.length; i++) {
            if (val[i].length != 2) val[i] += val[i];
        }

        this.rgb(+('0x' + val[1]), +('0x' + val[2]), +('0x' + val[3]));
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
