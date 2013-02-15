var analytics = require('analytics'),
    extend    = require('segmentio-extend');

(function () {

    var Provider = analytics.Provider.extend({
        key        : 'key',
        options    : {},
        initialize : function (options, ready) {
            setTimeout(ready, 200);
        },
        identify   : function (userId, traits) {},
        track      : function (event, properties) {},
        pageview   : function () {},
        alias      : function (newId, originalId) {}
    });
    analytics.addProvider('Test', Provider);

    var options = { 'Test' : 'x' };


    // Initialize
    // ----------

    suite('initialize');

    test('stores enabled providers', function () {
        // Reset the list of enabled providers first.
        analytics.providers = [];
        analytics.initialize(options);
        expect(analytics.providers[0] instanceof Provider).to.be(true);
    });

    test('sends options to enabled providers initialize', function () {
        var spy = sinon.spy(Provider.prototype, 'initialize');
        analytics.initialize(options);
        expect(spy.calledWith(sinon.match({ key : 'x' }))).to.be(true);
        spy.restore();
    });

    test('resets enabled providers and userId', function () {
        analytics.initialize(options);
        analytics.identify('user');

        expect(analytics.providers.length).to.equal(1);
        expect(analytics.userId).to.equal('user');

        analytics.initialize(options);

        expect(analytics.providers.length).to.equal(1);
        expect(analytics.userId).to.be(null);
    });


    // Ready
    // -----

    suite('ready');

    test('calls callbacks on initialize after a timeout', function (done) {
        // Turn off our current initialized state.
        analytics.initialized = false;

        var spy1 = sinon.spy();
        var spy2 = sinon.spy();

        analytics.ready(spy1);
        analytics.ready(spy2);
        expect(spy1.called).to.be(false);
        expect(spy2.called).to.be(false);

        analytics.initialize(options);
        expect(spy1.called).to.be(false);
        expect(spy2.called).to.be(false);

        setTimeout(function () {
            expect(spy1.called).to.be(true);
            expect(spy2.called).to.be(true);
            done();
        }, 250);
    });

    test('calls callbacks immediately when already initialized', function () {
        var spy = sinon.spy();

        analytics.ready(spy);
        expect(spy.called).to.be(true);
    });

    test('doesnt break on being passed a non-function', function () {
        expect(function () {
            analytics.ready('callback');
        }).to.not.throwException();
    });


    // Identify
    // --------

    suite('identify');

    test('is called on providers', function () {
        var spy = sinon.spy(Provider.prototype, 'identify');

        analytics.identify();

        expect(spy.called).to.be(true);

        spy.restore();
    });

    test('sends userId along', function () {
        var spy = sinon.spy(Provider.prototype, 'identify');

        analytics.identify('id');

        expect(spy.calledWith('id'));

        spy.restore();
    });

    test('sends a clone of traits along', function  () {
        var spy    = sinon.spy(Provider.prototype, 'identify');
        var traits = {
            age  : 23,
            name : 'Achilles'
        };

        analytics.identify('id', traits);

        expect(spy.args[0][1]).not.to.equal(traits);
        expect(spy.args[0][1]).to.eql(traits);

        spy.restore();
    });

    test('calls the callback after the timeout duration', function (done) {
        var callback = sinon.spy();

        analytics.identify('id', { name : 'Achilles' }, callback);

        // The callback shouldn't be called immediately, but after the timeout.
        expect(callback.called).to.be(false);
        setTimeout(function () {
            expect(callback.called).to.be(true);
            done();
        }, analytics.timeout);
    });

    test('takes a callback with optional traits or userId', function (done) {
        var finish   = _.after(3, done);
        var callback = sinon.spy();

        analytics.identify('id', callback);

        setTimeout(function () {
            expect(callback.called).to.be(true);
            finish();
        }, analytics.timeout);

        callback.reset();

        analytics.identify({ name : 'Achilles' }, callback);

        setTimeout(function () {
            expect(callback.called).to.be(true);
            finish();
        }, analytics.timeout);

        callback.reset();

        analytics.identify('id', { name : 'Achilles' }, callback);

        setTimeout(function () {
            expect(callback.called).to.be(true);
            finish();
        }, analytics.timeout);
    });


    // Track
    // -----

    suite('track');

    test('is called on providers', function () {
        var spy = sinon.spy(Provider.prototype, 'track');

        analytics.track();

        expect(spy.called).to.be(true);

        spy.restore();
    });

    test('sends event name along', function () {
        var spy = sinon.spy(Provider.prototype, 'track');

        analytics.track('party');

        expect(spy.calledWith('party')).to.be(true);

        spy.restore();
    });

    test('sends a clone of properties along', function  () {
        var spy        = sinon.spy(Provider.prototype, 'track');
        var properties = {
            level  : 'hard',
            volume : 11
        };

        analytics.track('party', properties);

        expect(spy.args[0][1]).not.to.equal(properties);
        expect(spy.args[0][1]).to.eql(properties);

        spy.restore();
    });

    test('calls the callback after the timeout duration', function (done) {
        var callback = sinon.spy();

        analytics.track('party', { level : 'hard' }, callback);

        // The callback shouldn't be called immediately, but after the timeout.
        expect(callback.called).to.be(false);
        setTimeout(function () {
            expect(callback.called).to.be(true);
            done();
        }, analytics.timeout);
    });


    // Track Link
    // ----------

    suite('trackLink');

    test('triggers a track on a link click', function () {
        var spy  = sinon.spy(Provider.prototype, 'track');
        var link = $('<a>')[0];

        analytics.trackLink(link, 'party');

        triggerClick(link);
        expect(spy.calledWith('party')).to.be(true);

        spy.restore();
    });

    test('triggers a track on a $link click', function () {
        var spy   = sinon.spy(Provider.prototype, 'track');
        var $link = $('<a>');

        analytics.trackLink($link, 'party');

        triggerClick($link[0]);

        expect(spy.calledWith('party')).to.be(true);

        spy.restore();
    });

    test('allows for properties to be a function', function () {
        var spy  = sinon.spy(Provider.prototype, 'track');
        var link = $('<a>')[0];

        analytics.trackLink(link, 'party', function () {
            return { type : 'crazy' };
        });

        triggerClick(link);

        expect(spy.calledWith('party', { type : 'crazy' })).to.be(true);

        spy.restore();
    });

    test('calls a properties function with the link that was clicked', function () {
        var spy    = sinon.spy();
        var link = $('<a>')[0];

        analytics.trackLink(link, 'party', spy);

        triggerClick(link);

        expect(spy.calledWith(link)).to.be(true);
    });

    test('triggers a track and loads an href on a link click with an href', function (done) {
        var spy  = sinon.spy(Provider.prototype, 'track');
        var link = $('<a href="#test">')[0];

        // Make sure hash is reset.
        window.location.hash = '';

        analytics.trackLink(link, 'party');

        triggerClick(link);

        // Expect the track call to have happened, but for the href not to have
        // been applied yet.
        expect(spy.calledWith('party')).to.be(true);
        expect(window.location.hash).not.to.equal('#test');

        // Expect the href to be applied after the timeout that gives events
        // time to send requests.
        setTimeout(function () {
            expect(window.location.hash).to.equal('#test');
            done();
        }, analytics.timeout);

        spy.restore();
    });

    test('triggers a track and loads the correct href on a link click with multiple links', function (done) {
        var spy  = sinon.spy(Provider.prototype, 'track');
        var link1 = $('<a href="#test1">')[0];
        var link2 = $('<a href="#test2">')[0];
        var link3 = $('<a href="#test3">')[0];

        // Make sure hash is reset.
        window.location.hash = '';

        analytics.trackLink([link1, link2, link3], 'party');

        triggerClick(link2);

        // Expect the track call to have happened, but for the href not to have
        // been applied yet.
        expect(spy.calledWith('party')).to.be(true);
        expect(window.location.hash).not.to.equal('#test2');

        // Expect the href to be applied after the timeout that gives events
        // time to send requests.
        setTimeout(function () {
            expect(window.location.hash).to.equal('#test2');
            done();
        }, analytics.timeout);

        spy.restore();
    });

    test('triggers a track but doesnt load an href on an href with blank target', function () {
        var spy  = sinon.spy(Provider.prototype, 'track');
        var link = $('<a href="http://google.com" target="_blank">')[0];

        // Make sure hash is reset.
        window.location.hash = '';

        analytics.trackLink(link, 'party');

        triggerClick(link);

        expect(spy.calledWith('party')).to.be(true);
        expect(window.location.hash).not.to.equal('#test');

        spy.restore();
    });

    test('triggers a track but doesnt load an href on a meta link click with an href', function () {
        var spy  = sinon.spy(Provider.prototype, 'track');
        var link = $('<a href="http://google.com">')[0];

        // Make sure hash is reset.
        window.location.hash = '';

        analytics.trackLink(link, 'party');

        triggerClick(link, true);

        expect(spy.calledWith('party')).to.be(true);
        expect(window.location.hash).not.to.equal('#test');

        spy.restore();
    });

    test('trackClick is aliased to trackLink for backwards compatibility', function () {
        expect(analytics.trackClick).to.equal(analytics.trackLink);
    });


    // Track Form
    // ----------

    suite('trackForm');

    test('triggers a track on a form submit', function () {
        var spy  = sinon.spy(Provider.prototype, 'track');
        var form = $('<form action="http://google.com" target="_blank"><input type="submit" /></form>')[0];

        analytics.trackForm(form, 'party');

        triggerClick($(form).find('input')[0]);

        expect(spy.calledWith('party')).to.be(true);

        spy.restore();
    });

    test('triggers a track on a form submit', function () {
        var spy   = sinon.spy(Provider.prototype, 'track');
        var $form = $('<form action="http://google.com" target="_blank"><input type="submit" /></form>');

        analytics.trackForm($form, 'party');

        triggerClick($form.find('input')[0]);

        expect(spy.calledWith('party')).to.be(true);

        spy.restore();
    });

    test('allows for properties to be a function', function () {
        var spy  = sinon.spy(Provider.prototype, 'track');
        var form = $('<form action="http://google.com" target="_blank"><input type="submit" /></form>')[0];

        analytics.trackForm(form, 'party', function () {
            return { type : 'crazy' };
        });

        triggerClick($(form).find('input')[0]);

        expect(spy.calledWith('party', { type : 'crazy' })).to.be(true);

        spy.restore();
    });

    test('calls a properties function with the form that was clicked', function () {
        var spy  = sinon.spy();
        var form = $('<form action="http://google.com" target="_blank"><input type="submit" /></form>')[0];

        analytics.trackForm(form, 'party', spy);

        triggerClick($(form).find('input')[0]);

        expect(spy.calledWith(form)).to.be(true);
    });

    test('trackSubmit is aliased to trackForm for backwards compatibility', function () {
        expect(analytics.trackSubmit).to.equal(analytics.trackForm);
    });


    // Pageview
    // --------

    suite('pageview');

    test('gets called on providers', function () {
        var spy = sinon.spy(Provider.prototype, 'pageview');

        analytics.pageview();

        expect(spy.called).to.be(true);

        spy.restore();
    });


    // Alias
    // -----

    suite('alias');

    test('gets called on providers', function () {
        var spy = sinon.spy(Provider.prototype, 'alias');

        analytics.alias();

        expect(spy.called).to.be(true);

        spy.restore();
    });


})();


// Helper to trigger true DOM click events in all browser ... and IE. Believe it
// or not `initMouseEvent` isn't even an IE thing:
// https://developer.mozilla.org/en-US/docs/DOM/event.initMouseEvent
function triggerClick (element, isMeta) {
    var e;
    if (document.createEvent) {
        e = document.createEvent('MouseEvent');
        if (isMeta)
            e.initMouseEvent('click', true, true, null,
                             null, null, null, null, null,
                             true, true, true, true,
                             0, null);
        else
            e.initMouseEvent('click', true, true, null,
                             null, null, null, null, null,
                             false, false, false, false,
                             0, null);
        element.dispatchEvent(e);
    } else {
        if (isMeta) {
            e = document.createEventObject({
                altKey   : true,
                ctrlKey  : true,
                shiftKey : true
            });
        }
        element.fireEvent('onClick', e);
    }
}
