/**
 * @preserve SilkTouch (c) KNOWLEDGECODE | MIT
 */
(function (global) {
    'use strict';

    var matches = (function () {
        var p = Element.prototype,
            m = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector;

        return function (target, selector) {
            return m.call(target, selector);
        };
    }());

    var silktouch = {}, handlers = {}, suspenders = [], bubbles;

    var SilkTouchEvent = function (evt) {
        this.originalEvent = evt;
    };

    SilkTouchEvent.prototype.preventDefault = function () {
        this.originalEvent.preventDefault();
    };
    SilkTouchEvent.prototype.stopPropagation = function () {
        bubbles = false;
    };

    var listener = function (evt) {
        var i, name, ste, target = evt.target,
            candidates = Object.keys(handlers).filter(function (n) {
                return !~suspenders.indexOf(n);
            });

        if (candidates.length) {
            ste = new SilkTouchEvent(evt);
            bubbles = true;
        }
        while (target.parentNode) {
            i = 0;
            while (candidates.length > i) {
                name = candidates[i];
                if (matches(target, handlers[name].selector)) {
                    candidates.splice(i, 1);
                    handlers[name].handler.call(target, ste);
                } else {
                    i++;
                }
            }
            if (!candidates.length || !bubbles) {
                break;
            }
            target = target.parentNode;
        }
    };

    var sx, sy;

    if ('ontouchstart' in global) {
        document.addEventListener('touchstart', function (evt) {
            sx = evt.changedTouches[0].pageX;
            sy = evt.changedTouches[0].pageY;
        }, false);
        document.addEventListener('touchend', function (evt) {
            var ex = evt.changedTouches[0].pageX,
                ey = evt.changedTouches[0].pageY;

            if (Math.abs(ex - sx) > 10 || Math.abs(ey - sy) > 10) {
                return;
            }
            listener(evt);
        }, false);
    } else {
        document.addEventListener('click', listener, false);
    }

    /**
     * on
     * @param {string} name - A unique event name
     * @param {string} selector - A selector which you want to match.
     * @param {Function} handler - An event listener
     * @returns {Object} silktouch
     */
    silktouch.on = function (name, selector, handler) {
        if (!handlers[name]) {
            handlers[name] = { selector: selector, handler: handler };
        }
        return this;
    };

    /**
     * off
     * @param {string} [name] - An event name which want to delete from the registered events. Omitting it is equivalent to delete all the events.
     * @returns {Object} silktouch
     */
    silktouch.off = function (name) {
        var index;

        if (arguments.length) {
            if (handlers[name]) {
                delete handlers[name];
            }
            index = suspenders.indexOf(name);
            if (~index) {
                suspenders.splice(index, 1);
            }
        } else {
            handlers = {};
            suspenders.length = 0;
        }
        return this;
    };

    /**
     * one
     * @param {string} name - A unique event name
     * @param {string} selector - A selector which you want to match.
     * @param {Function} handler - An event listener, which is fired only once.
     * @returns {Object} silktouch
     */
    silktouch.one = function (name, selector, handler) {
        return this.on(name, selector, function (evt) {
            this.off(name);
            handler(evt);
        }.bind(this));
    };

    /**
     * suspend
     * @param {string} [name] - An event name which want to suspend. Omitting it is equivalent to suspend all the events.
     * @returns {Object} silktouch
     */
    silktouch.suspend = function (name) {
        if (arguments.length) {
            if (handlers[name] && !~suspenders.indexOf(name)) {
                suspenders.push(name);
            }
        } else {
            Object.keys(handlers).forEach(function (nm) {
                silktouch.suspend(nm);
            });
        }
        return this;
    };

    /**
     * resume
     * @param {string} [name] - An event name which want to resume. Omitting it is equivalent to resume all the events.
     * @returns {Object} silktouch
     */
    silktouch.resume = function (name) {
        var index;

        if (arguments.length) {
            index = suspenders.indexOf(name);
            if (~index) {
                suspenders.splice(index, 1);
            }
        } else {
            suspenders.length = 0;
        }
        return this;
    };

    /**
     * names
     * @param {boolean} [suspended] - Whether getting the suspended event names instead of all the event names.
     * @returns {Array.<string>} An array of names
     */
    silktouch.names = function (suspended) {
        return suspended ? suspenders.slice() : Object.keys(handlers);
    };

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = silktouch;
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return silktouch;
        });
    } else {
        global.silktouch = silktouch;
    }
// [[ This area will be removed with `npm run build` command.
    silktouch.touchable = (function () {
        return 'ontouchstart' in global;
    }());

    silktouch.sim = (function () {
        if (silktouch.touchable) {
            return function (element) {
                var touchstart = document.createEvent('Event');
                touchstart.initEvent('touchstart', true, true);
                touchstart.changedTouches = [ { pageX: 0, pageY: 0 } ];
                element.dispatchEvent(touchstart);

                var touchend = document.createEvent('Event');
                touchend.initEvent('touchend', true, true);
                touchend.changedTouches = [ { pageX: 0, pageY: 0 } ];
                element.dispatchEvent(touchend);

                setTimeout(function () {
                    if (touchend.defaultPrevented) {
                        return;
                    }
                    var click = document.createEvent('Event');
                    click.initEvent('click', true, true);
                    element.dispatchEvent(click);
                }, 0);
            };
        }
        return function (element) {
            var click = document.createEvent('Event');
            click.initEvent('click', true, true);
            element.dispatchEvent(click);
        };
    }());
// ]]
}(this));

