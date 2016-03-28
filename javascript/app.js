window.app = (function(window){
    'use strict'

    var App = function() {
        this.elements = null;
        this.init();
        this.addEvents();
    }

    App.prototype.init = function() {
        var hex = hash.get('hex');
        this.elements = {
            madeHeart: $('.heart use'),
            made: $('.made a'),
            main: $('main'),
            hsl: $('.hsl'),
            hex: $('.hex'),
            rgb: $('.rgb')
        };

        if (color.regHEX.test(hex)) {
            color.fromHEX(hex);
            this.changeColor(color);
        }
    };

    App.prototype.addEvents = function() {
        document.addEventListener('keypress', this.onKPress.bind(this));
    };

    App.prototype.setBackgroundColor = function(rgb) {
        this.elements.main.style.backgroundColor = (
            color.formatRGB(rgb)
        );
    };

    App.prototype.setElementsColor = function(color) {
        this.elements.made.style.color = color;
        this.elements.madeHeart.style.stroke = color;

        this.elements.hsl.style.color = color;
        this.elements.hex.style.color = color;
        this.elements.rgb.style.color = color;
    };

    App.prototype.updateValues = function(obj) {
        this.elements.hsl.innerHTML = color.formatHSL(obj);
        this.elements.hex.innerHTML = color.formatHEX(obj);
        this.elements.rgb.innerHTML = color.formatRGB(obj);
    };

    App.prototype.changeColor = function(val) {
        var self = this;
        var vals = [color.toHSL(true), color.toRGB(true)];
        color.rgb(val.r, val.g, val.b);
        vals.push(color.toHSL(true), color.toRGB(true));

        if (vals[2].l < 50) {
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
            complete: function() { hash.set('hex', color.toHEX().slice(1)); },
            change: function(val) {
                self.setBackgroundColor(val);
                self.updateValues(val);
            }
        });
    };

    App.prototype.onKPress = function(event) {
        var keyCode = event.keyCode || event.charCode || event.witch;
        if (keyCode == 32) {
            this.changeColor({
                r: util.rand(0, 255),
                g: util.rand(0, 255),
                b: util.rand(0, 255)
            });
        }
    };

    return new App();
})(this);
