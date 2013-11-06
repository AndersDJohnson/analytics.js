
describe('Vero', function () {

  var assert = require('assert');
  var equal = require('equals');
  var sinon = require('sinon');
  var test = require('integration-tester');
  var Vero = require('analytics/lib/integrations/vero');
  var when = require('when');

  var vero;
  var settings = {
    apiKey: 'x'
  };

  beforeEach(function () {
    vero = new Vero(settings);
    vero.initialize(); // noop
  });

  afterEach(function () {
    vero.reset();
  });

  it('should store the proper settings', function () {
    test(vero)
      .assumesPageview()
      .readyOnInitialize()
      .global('_veroq')
      .option('apiKey', '');
  });

  describe('#initialize', function () {
    it('should push onto _veroq', function () {
      vero.initialize();
      assert(equal(window._veroq[0], ['init', { api_key: settings.apiKey }]));
    });

    it('should call #load', function () {
      vero.load = sinon.spy();
      vero.initialize();
      assert(vero.load.called);
    });
  });

  describe('#load', function () {
    it('should create window.__adroll', function (done) {
      assert(!window._veroq);
      vero.load();
      when(function () {
        return window._veroq && window._veroq.push !== Array.prototype.push;
      }, done);
    });

    it('should callback', function (done) {
      vero.load(done);
    });
  });

  describe('#identify', function () {
    beforeEach(function () {
      vero.initialize();
      window._veroq.push = sinon.spy();
    });

    it('shouldnt send just an id', function () {
      vero.identify('id');
      assert(!window._veroq.push.called);
    });

    it('shouldnt send without an id', function () {
      vero.identify(null, { trait: true });
      assert(!window._veroq.push.called);
    });

    it('should send an id and email', function () {
      vero.identify('id', { email: 'name@example.com' });
      assert(window._veroq.push.calledWith(['user', {
        id: 'id',
        email: 'name@example.com'
      }]));
    });

    it('should send an id and traits', function () {
      vero.identify('id', {
        email: 'name@example.com',
        trait: true
      });
      assert(window._veroq.push.calledWith(['user', {
        id: 'id',
        email: 'name@example.com',
        trait: true
      }]));
    });
  });

  describe('#track', function () {
    beforeEach(function () {
      vero.initialize();
      window._veroq.push = sinon.spy();
    });

    it('should send an event', function () {
      vero.track('event');
      assert(window._veroq.push.calledWith(['track', 'event', undefined]));
    });

    it('should send an event and properties', function () {
      vero.track('event', { property: true });
      assert(window._veroq.push.calledWith(['track', 'event', { property: true }]));
    });
  });

});
