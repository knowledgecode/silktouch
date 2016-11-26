(function (global) {
    'use strict';

    describe('silktouch', function () {
        var expect, doc, silktouch;

        var html = '<div id="block1" class="block1">'
                 + '  <div id="block2" class="block2">'
                 + '  </div>'
                 + '</div>';

        var getEl = function (id) {
            return doc.getElementById(id);
        };

        before(function (done) {
            try {
                // for mocha
                require('jsdom').env(html, [
                    './node_modules/expect.js/index.js',
                    './silktouch.dev.js'
                ], function (err, window) {
                    if (err) {
                        return done(err);
                    }
                    expect = window.expect;
                    doc = window.document;
                    silktouch = window.silktouch;
                    silktouch.enchant();
                    return done();
                });
            } catch (e) {
                // for mocha-phantomjs
                expect = global.expect;
                doc = global.document;
                silktouch = global.silktouch;
                silktouch.enchant();
                done();
            }
        });

        var test = function (done, f) {
            try {
                if (f) {
                    f();
                }
                done();
            } catch (e) {
                done(e);
            }
        };

        var delay = function (done, f) {
            setTimeout(function () {
                test(done, f);
            }, 10);
        };

        var error = function (done) {
            test(done, function () {
                expect().to.be.ok();
            });
        };

        it('Register Event 1', function (done) {
            silktouch.on('test1', '#block1', function () {
                test(done, silktouch.off);
            });
            expect(silktouch.names()).to.eql(['test1']);
            silktouch.sim(getEl('block1'));
        });

        it('Register Event 2', function (done) {
            silktouch.on('test2', '#block1', function () {
                test(done, silktouch.off);
            });
            expect(silktouch.names()).to.eql(['test2']);
            silktouch.sim(getEl('block2'));
        });

        it('stopPropagation', function (done) {
            silktouch.on('test3.1', '#block2', function (evt) {
                silktouch.off('test3.1');
                evt.stopPropagation();
                delay(done, function () {
                    silktouch.off('test3.2');
                });
            });
            silktouch.on('test3.2', '#block1', function () {
                silktouch.off('test3.2');
                // It causes error if fired.
                error(done);
            });
            expect(silktouch.names()).to.eql(['test3.1', 'test3.2']);
            silktouch.sim(getEl('block2'));
        });

        it('preventDefault', function (done) {
            // If touch event is not supported, skips the below test.
            if (!silktouch.touchable) {
                done();
                return;
            }

            var element = getEl('block2');
            var listener = function () {
                // It causes error if fired.
                error(done);
            };

            silktouch.on('test4', '#block2', function (evt) {
                silktouch.off('test4');
                evt.preventDefault();
                delay(done, function () {
                    element.removeEventListener('click', listener, false);
                });
            });
            expect(silktouch.names()).to.eql(['test4']);

            element.addEventListener('click', listener, false);
            silktouch.sim(element);
        });

        it('Top Element', function (done) {
            silktouch.on('test5', 'html', function () {
                test(done, silktouch.off);
            });
            expect(silktouch.names()).to.eql(['test5']);
            silktouch.sim(getEl('block1'));
        });

        it('Remove Event', function (done) {
            silktouch.on('test6', '#block1', function () {
                // It causes error if fired.
                error(done);
            });
            expect(silktouch.names()).to.eql(['test6']);
            silktouch.off('test6');
            expect(silktouch.names()).to.eql([]);
            silktouch.sim(getEl('block1'));
            delay(done);
        });

        it('Remove All Events', function (done) {
            silktouch.on('test7.1', '#block1', function () {
                // It causes error if fired.
                error(done);
            });
            silktouch.on('test7.2', '#block2', function () {
                // It causes error if fired.
                error(done);
            });
            expect(silktouch.names()).to.eql(['test7.1', 'test7.2']);
            silktouch.off();
            expect(silktouch.names()).to.eql([]);
            silktouch.sim(getEl('block1'));
            silktouch.sim(getEl('block2'));
            delay(done);
        });

        it('Register Event 3', function (done) {
            silktouch.one('test8', '#block1', function () {
                test(done, function () {
                    expect(silktouch.names()).to.eql([]);
                });
            });
            expect(silktouch.names()).to.eql(['test8']);
            silktouch.sim(getEl('block1'));
        });

        it('Register Event 4', function (done) {
            silktouch.one('test9', '#block1', function () {
                test(done, function () {
                    expect(silktouch.names()).to.eql([]);
                });
            });
            expect(silktouch.names()).to.eql(['test9']);
            silktouch.sim(getEl('block2'));
        });

        it('Fire Once', function (done) {
            silktouch.one('test10', '#block1', function () {
                silktouch.sim(getEl('block1'));
                test(done, function () {
                    expect(silktouch.names()).to.eql([]);
                });
            });
            expect(silktouch.names()).to.eql(['test10']);
            silktouch.sim(getEl('block1'));
        });

        it('Remove Event Before It\'s Fired', function (done) {
            silktouch.one('test11', '#block2', function () {
                // It causes error if fired.
                error(done);
            });
            expect(silktouch.names()).to.eql(['test11']);
            silktouch.off('test11');
            expect(silktouch.names()).to.eql([]);
            silktouch.sim(getEl('block2'));
            delay(done);
        });

        it('Suspend Event', function (done) {
            silktouch.on('test12', '#block1', function () {
                // It causes error if fired.
                error(done);
            });
            silktouch.suspend('test12');
            expect(silktouch.names()).to.eql(['test12']);
            expect(silktouch.names(true)).to.eql(['test12']);
            silktouch.sim(getEl('block1'));
            delay(done, function () {
                silktouch.off('test12');
            });
        });

        it('Suspend All Events', function (done) {
            silktouch.on('test13.1', '#block1', function () {
                // It causes error if fired.
                error(done);
            });
            silktouch.on('test13.2', '#block2', function () {
                // It causes error if fired.
                error(done);
            });
            silktouch.suspend();
            expect(silktouch.names()).to.eql(['test13.1', 'test13.2']);
            expect(silktouch.names(true)).to.eql(['test13.1', 'test13.2']);
            silktouch.sim(getEl('block1'));
            silktouch.sim(getEl('block2'));
            delay(done, silktouch.off);
        });

        it('Resume Event', function (done) {
            silktouch.on('test14', '#block1', function () {
                test(done, silktouch.off);
            });
            silktouch.suspend('test14');
            expect(silktouch.names()).to.eql(['test14']);
            expect(silktouch.names(true)).to.eql(['test14']);
            silktouch.resume('test14');
            expect(silktouch.names()).to.eql(['test14']);
            expect(silktouch.names(true)).to.eql([]);
            silktouch.sim(getEl('block1'));
        });

        it('Resume All Events', function (done) {
            var fired = false,
                listener = function (evt) {
                    evt.stopPropagation();
                    if (fired) {
                        test(done, silktouch.off);
                    }
                    fired = true;
                };

            silktouch.on('test15.1', '#block1', listener);
            silktouch.on('test15.2', '#block2', listener);
            silktouch.suspend();
            expect(silktouch.names()).to.eql(['test15.1', 'test15.2']);
            expect(silktouch.names(true)).to.eql(['test15.1', 'test15.2']);
            silktouch.resume();
            expect(silktouch.names()).to.eql(['test15.1', 'test15.2']);
            expect(silktouch.names(true)).to.eql([]);
            silktouch.sim(getEl('block1'));
            silktouch.sim(getEl('block2'));
        });

        it('Remove Event During Suspend', function (done) {
            silktouch.on('test16', '#block1', function () {
                // It causes error if fired.
                error(done);
            });
            silktouch.suspend('test16');
            expect(silktouch.names()).to.eql(['test16']);
            expect(silktouch.names(true)).to.eql(['test16']);
            silktouch.off('test16');
            expect(silktouch.names()).to.eql([]);
            expect(silktouch.names(true)).to.eql([]);
            silktouch.resume('test16');
            silktouch.sim(getEl('block1'));
            delay(done);
        });

        it('Register Duplicate Name', function (done) {
            silktouch.on('test17', '#block1', function () {
                test(done, silktouch.off);
            });
            silktouch.on('test17', '#block2', function () {
                // It causes error if fired.
                error(done);
            });
            silktouch.sim(getEl('block2'));
            silktouch.sim(getEl('block1'));
        });

        it('Remove Same Event Repeatedly', function (done) {
            silktouch.on('test18', '#block1', function () {
                // It causes error if fired.
                error(done);
            });
            silktouch.off('test18');
            expect(silktouch.names()).to.eql([]);
            silktouch.off('test18');
            expect(silktouch.names()).to.eql([]);
            silktouch.sim(getEl('block1'));
            delay(done);
        });

        it('Suspend Same Event Repeatedly', function (done) {
            silktouch.on('test19', '#block1', function () {
                // It causes error if fired.
                error(done);
            });
            silktouch.suspend('test19');
            expect(silktouch.names()).to.eql(['test19']);
            expect(silktouch.names(true)).to.eql(['test19']);
            silktouch.suspend('test19');
            expect(silktouch.names()).to.eql(['test19']);
            expect(silktouch.names(true)).to.eql(['test19']);
            silktouch.sim(getEl('block1'));
            delay(done, silktouch.off);
        });

        it('Resume Same Event Repeatedly', function (done) {
            silktouch.on('test20', '#block1', function () {
                test(done, silktouch.off);
            });
            silktouch.suspend('test20');
            silktouch.resume('test20');
            expect(silktouch.names()).to.eql(['test20']);
            expect(silktouch.names(true)).to.eql([]);
            silktouch.resume('test20');
            expect(silktouch.names()).to.eql(['test20']);
            expect(silktouch.names(true)).to.eql([]);
            silktouch.sim(getEl('block1'));
        });

        it('Register Duplicate Name During Suspend', function (done) {
            silktouch.on('test21', '#block1', function () {
                // It causes error if fired.
                error(done);
            });
            silktouch.suspend('test21');
            silktouch.on('test21', '#block2', function () {
                // It causes error if fired.
                error(done);
            });
            silktouch.sim(getEl('block2'));
            silktouch.sim(getEl('block1'));
            delay(done, silktouch.off);
        });

        it('Illegal Name 1', function (done) {
            silktouch.on(null, '#block1', function () {
                test(done, silktouch.off);
            });
            expect(silktouch.names()).to.eql(['null']);
            silktouch.sim(getEl('block1'));
        });

        it('Illegal Name 2', function (done) {
            silktouch.on(100, '#block1', function () {
                test(done, silktouch.off);
            });
            expect(silktouch.names()).to.eql(['100']);
            silktouch.sim(getEl('block1'));
        });

        it('Illegal Name 3', function (done) {
            var date = new Date();

            silktouch.on(date, '#block1', function () {
                test(done, silktouch.off);
            });
            expect(silktouch.names()).to.eql([date.toString()]);
            silktouch.sim(getEl('block1'));
        });

        it('Illegal Name 4', function (done) {
            silktouch.on(NaN, '#block1', function () {
                test(done, silktouch.off);
            });
            expect(silktouch.names()).to.eql(['NaN']);
            silktouch.sim(getEl('block1'));
        });

        it('Illegal Name 5', function (done) {
            silktouch.on(undefined, '#block1', function () {
                test(done, silktouch.off);
            });
            expect(silktouch.names()).to.eql(['undefined']);
            silktouch.sim(getEl('block1'));
        });

        it('Illegal Name 6', function (done) {
            silktouch.on(true, '#block1', function () {
                test(done, silktouch.off);
            });
            expect(silktouch.names()).to.eql(['true']);
            silktouch.sim(getEl('block1'));
        });
    });

}(this));

