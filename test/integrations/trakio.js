
describe('trak.io', function () {

  var assert = require('assert');
  var each = require('each');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var Trakio = require('analytics/lib/integrations/trakio');
  var tick = require('next-tick');
  var when = require('when');

  var trakio;
  var settings = {
    token: '740d36a79fb593bbc034a3ac934bc04f5a591c0c'
  };

  beforeEach(function () {
    trakio = new Trakio(settings);
    trakio.initialize(); // noop
  });

  afterEach(function () {
    trakio.reset();
  });

  it('should store the right settings', function () {
    test(trakio)
      .name('trak.io')
      .assumesPageview()
      .readyOnInitialize()
      .global('trak')
      .option('token', '')
      .option('trackNamedPages', true);
  });

  describe('#initialize', function () {
    it('should call load', function () {
      trakio.load = sinon.spy();
      trakio.initialize();
      assert(trakio.load.called);
    });

    it('should set up the window.trak.io variables', function () {
      trakio.initialize();
      assert(window.trak.io);
      assert(window.trak.io.identify);
      assert(window.trak.io.track);
      assert(window.trak.io.alias);
    });
  });

  describe('#load', function () {
    it('should load the trak object', function (done) {
      assert(!window.trak);
      trakio.load();
      when(function () {
        return window.trak && window.trak.loaded;
      }, done);
    });
  });

  describe('#identify', function () {
    beforeEach(function () {
      trakio.initialize();
      window.trak.io.identify = sinon.spy();
    });

    it('should send id', function () {
      trakio.identify('id');
      assert(window.trak.io.identify.calledWith('id', {}));
    });

    it('should send traits', function () {
      trakio.identify(null, { trait: true });
      assert(window.trak.io.identify.calledWith({ trait: true }));
    });

    it('should send an id and traits', function () {
      trakio.identify('id', { trait: true });
      assert(window.trak.io.identify.calledWith('id', { trait: true }));
    });

    it('should alias traits', function () {
      trakio.identify(null, {
        avatar: 'avatar',
        firstName: 'first',
        lastName: 'last'
      });
      assert(window.trak.io.identify.calledWith({
        avatar_url: 'avatar',
        first_name: 'first',
        last_name: 'last'
      }));
    });
  });

  describe('#track', function () {
    beforeEach(function () {
      trakio.initialize();
      window.trak.io.track = sinon.spy();
    });

    it('should send an event', function () {
      trakio.track('event');
      assert(window.trak.io.track.calledWith('event'));
    });

    it('should send an event and properties', function () {
      trakio.track('event', { property: true });
      assert(window.trak.io.track.calledWith('event', { property: true }));
    });
  });

  describe('#page', function () {
    beforeEach(function () {
      trakio.initialize();
      window.trak.io.page_view = sinon.spy();
    });

    it('should call pageview', function () {
      trakio.page();
      assert(window.trak.io.page_view.called);
    });

    it('should send a page name', function () {
      trakio.page('Signup');
      assert(window.trak.io.page_view.calledWith(undefined, 'Signup'));
    });

    it('should send properties if they are included', function () {
      trakio.page(null, { url: 'url', title: 'title' });
      assert(window.trak.io.page_view.calledWith('url', 'title'));
    });

    it('should call #track for named pages by default', function () {
      window.trak.io.track = sinon.spy();
      trakio.page('Signup');
      assert(window.trak.io.track.calledWith('Viewed Signup Page'));
    });
  });

  describe('#alias', function () {
    beforeEach(function (done) {
      trakio.once('load', function () {
        tick(function () {
          window.trak.io.distinct_id = sinon.stub();
          window.trak.io.alias = sinon.spy();
          done();
        });
      });
      trakio.initialize();
    });

    it('should send a new id', function () {
      trakio.alias('new');
      assert(window.trak.io.alias.calledWith('new'));
    });

    it('should send a new id and an original id', function () {
      trakio.alias('another', 'original');
      assert(window.trak.io.alias.calledWith('original', 'another'));
    });
  });
});
