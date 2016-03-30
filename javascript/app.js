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
