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

    /**
     * enchant
     * @param {Object} [baseElement] - A base element that manages a touch or a click event. Omitting it is equivalent to specify the `document`.
     * @returns {void}
     */
    silktouch.enchant = function (baseElement) {
        var style, meta, sx, sy, trgt;

        // This method is able to be called only once.
        silktouch.enchant = function () {};
        baseElement = baseElement || document;

        if ('ontouchstart' in global) {
            if (!document.querySelector('meta[name="viewport"]')) {
                meta = document.createElement('meta');
                meta.name = 'viewport';
                // In iOS 10, `user-scalable=no` is ignored.
                meta.content = 'width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1';
                document.head.appendChild(meta);
            }
            style = document.documentElement.style;
            if ('touch-action' in style) {
                style.touchAction = 'manipulation';
                baseElement.addEventListener('click', listener, true);
            } else {
                baseElement.addEventListener('touchstart', function (evt) {
                    sx = evt.changedTouches[0].pageX;
                    sy = evt.changedTouches[0].pageY;
                }, {
                    capture: true,
                    passive: true
                });
                baseElement.addEventListener('touchend', function (evt) {
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
                baseElement.addEventListener('touchcancel', function () {
                    trgt = undefined;
                }, true);
                baseElement.addEventListener('click', function (evt) {
                    if (evt.target !== trgt) {
                        evt.preventDefault();
                    }
                    trgt = undefined;
                }, true);
            }
        } else {
            baseElement.addEventListener('click', listener, true);
        }
    };

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

}(this));

