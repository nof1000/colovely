window.app = (function(window){
    'use strict'

    var elMain = document.querySelector('main');

    var elResult = document.querySelector('.result');
    var elHsl = document.querySelector('.hsl');
    var elRgb = document.querySelector('.rgb');

    var elAuthor = document.querySelector('.author a');
    var elHeart = document.querySelector('.heart use');

    color.fromHEX('#ff1744');

    function randly() {
        var rgb = [];
        var hsl = [];
        var hex = [];

        rgb.push(color.toRGB(true));
        hsl.push(color.toHSL(true));
        hex.push(color.toHEX(true));
        color.rgb(
            util.rand(0, 255),
            util.rand(0, 255),
            util.rand(0, 255)
        );
        rgb.push(color.toRGB(true));
        hsl.push(color.toHSL(true));
        hex.push(color.toHEX(true));

        var brig = (rgb[1].r * 299 + rgb[1].g * 587 + rgb[1].b * 114) / 1000;

        if (brig > 125) {
            elResult.style.color = '#222';
            elHsl.style.color = '#222';
            elRgb.style.color = '#222';

            elAuthor.style.color = '#222';
            elHeart.style.stroke = '#222';
        } else {
            elResult.style.color = '#fff';
            elHsl.style.color = '#fff';
            elRgb.style.color = '#fff';

            elAuthor.style.color = '#fff';
            elHeart.style.stroke = '#fff';
        }

        elResult.innerHTML = color.toHEX();
        elHsl.innerHTML = color.toHSL();
        elRgb.innerHTML = color.toRGB();

        util.anim({
            values: {
                r: [rgb[0].r, rgb[1].r],
                g: [rgb[0].g, rgb[1].g],
                b: [rgb[0].b, rgb[1].b],
                h: [hsl[0].h, hsl[1].h],
                s: [hsl[0].s, hsl[1].s],
                l: [hsl[0].l, hsl[1].l],
                hex: [hex[0], hex[1]]
            },
            duration: 500
        }, function(val, end) {
            var output = color.formatRGB(val.r ^ 0, val.g ^ 0, val.b ^ 0);
            elMain.style.backgroundColor = output;
            elRgb.innerHTML = output;
            elHsl.innerHTML = color.formatHSL(val.h ^ 0, val.s ^ 0, val.l ^ 0);
            elResult.innerHTML = '#' + (val.hex ^ 0).toString(16);
        });
    }

    document.addEventListener('keypress', function(event) {
        var keyCode = event.keyCode || event.charCode || event.witch;
        if (keyCode == 32) return randly();
    });

    return true;
})(this);
