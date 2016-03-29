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
