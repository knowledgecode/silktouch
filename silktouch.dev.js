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

    var silktouch = {}, handlers = {}, suspenders = [], candidates = [];

    var SilkTouchEvent = function (evt) {
        this.originalEvent = evt;
        this.bubbles = true;
    };

    SilkTouchEvent.prototype.preventDefault = function () {
        this.originalEvent.preventDefault();
    };
    SilkTouchEvent.prototype.stopPropagation = function () {
        this.bubbles = false;
    };

    var elect = function () {
        return Object.keys(handlers).filter(function (n) {
            return !~suspenders.indexOf(n);
        });
    };

    var listener = function (evt) {
        var i, name, ste, target = evt.target, cand = candidates.slice();

        while (target.parentNode) {
            i = 0;
            while (cand.length > i) {
                name = cand[i];
                if (matches(target, handlers[name].selector)) {
                    cand.splice(i, 1);
                    ste = ste || new SilkTouchEvent(evt);
                    handlers[name].handler.call(target, ste);
                } else {
                    i++;
                }
            }
            if (!cand.length || ste && !ste.bubbles) {
                break;
            }
            target = target.parentNode;
        }
    };

    var sx, sy, trgt;

    if ('ontouchstart' in global) {
        document.addEventListener('touchstart', function (evt) {
            sx = evt.changedTouches[0].pageX;
            sy = evt.changedTouches[0].pageY;
        }, { capture: true, passive: true });
        document.addEventListener('touchend', function (evt) {
            var ex = evt.changedTouches[0].pageX,
                ey = evt.changedTouches[0].pageY;

            trgt = undefined;
            if (Math.abs(ex - sx) > 4 || Math.abs(ey - sy) > 4) {
                evt.preventDefault();
                return;
            }
            listener(evt);
            trgt = evt.target;
        }, true);
        document.addEventListener('touchcancel', function () {
            trgt = undefined;
        }, true);
        document.addEventListener('click', function (evt) {
            if (evt.target !== trgt) {
                evt.preventDefault();
            }
            trgt = undefined;
        }, true);
    } else {
        document.addEventListener('click', listener, true);
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
            candidates = elect();
        }
        return this;
    };

    /**
     * off
     * @param {string} [name] - An event name which want to delete from the registered events. Omitting it is equivalent to delete all the events.
     * @returns {Object} silktouch
     */
    silktouch.off = function (name) {
        if (arguments.length) {
            if (handlers[name]) {
                delete handlers[name];
            }
        } else {
            handlers = {};
        }
        return silktouch.resume(name);
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
        if (name) {
            if (handlers[name] && !~suspenders.indexOf(name)) {
                suspenders.push(name);
            }
        } else {
            Object.keys(handlers).forEach(function (nm) {
                silktouch.suspend(nm);
            });
        }
        candidates = elect();
        return this;
    };

    /**
     * resume
     * @param {string} [name] - An event name which want to resume. Omitting it is equivalent to resume all the events.
     * @returns {Object} silktouch
     */
    silktouch.resume = function (name) {
        var index;

        if (name) {
            index = suspenders.indexOf(name);
            if (~index) {
                suspenders.splice(index, 1);
            }
        } else {
            suspenders.length = 0;
        }
        candidates = elect();
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

