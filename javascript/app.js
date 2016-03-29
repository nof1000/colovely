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
        document.addEventListener('keypress', this.onKPress.bind(this));
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
            complete: function() {
            },
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
            }, true);
        } else if (keyCode == 97 || keyCode == 100) {
            var pos = (keyCode == 97) ? colorStore.position - 1 : colorStore.position + 1;
            colorStore.setFocus(pos);
        }
    };

    return new App();
})(this);
