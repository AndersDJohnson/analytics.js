
describe('Mixpanel', function () {

var analytics = window.analytics || require('analytics')
  , assert = require('assert')
  , sinon = require('sinon')
  , when = require('when');

var settings = {
  token: 'x'
};

before(function (done) {
  this.timeout(10000);
  this.spy = sinon.spy();
  analytics.ready(this.spy);
  analytics.initialize({ Mixpanel: settings });
  this.integration = analytics._integrations.Mixpanel;
  this.options = this.integration.options;
  when(function () { return window.mixpanel.config; }, done);
});

describe('#name', function () {
  it('Mixpanel', function () {
    assert(this.integration.name == 'Mixpanel');
  });
});

describe('#key', function () {
  it('token', function () {
    assert(this.integration.key == 'token');
  });
});

describe('#defaults', function () {
  it('cookieName', function () {
    assert(this.integration.defaults.cookieName === '');
  });

  it('initialPageview', function () {
    assert(this.integration.defaults.initialPageview === false);
  });

  it('nameTag', function () {
    assert(this.integration.defaults.nameTag === true);
  });

  it('pageview', function () {
    assert(this.integration.defaults.pageview === false);
  });

  it('people', function () {
    assert(this.integration.defaults.people === false);
  });

  it('token', function () {
    assert(this.integration.defaults.token === '');
  });
});

describe('#initialize', function () {
  it('should call ready', function () {
    assert(this.spy.called);
  });

  it('should store options', function () {
    var defaults = this.integration.defaults;
    assert(this.options.token == settings.token);
    assert(this.options.cookieName == defaults.cookieName);
    assert(this.options.initialPageview == defaults.initialPageview);
    assert(this.options.nameTag == defaults.nameTag);
    assert(this.options.pageview == defaults.pageview);
    assert(this.options.people == defaults.people);
  });

  it('should pass options to Mixpanel', function () {
    var defaults = this.integration.defaults;
    assert(window.mixpanel.config.token == settings.token);
    assert(window.mixpanel.config.cookie_name == defaults.cookieName);
  });
});

describe('#identify', function () {
  beforeEach(function () {
    analytics.user().reset();
    this.identifyStub = sinon.stub(window.mixpanel, 'identify');
    this.registerStub = sinon.stub(window.mixpanel, 'register');
    this.nameTagStub = sinon.stub(window.mixpanel, 'name_tag');
    this.peopleStub = sinon.stub(window.mixpanel.people, 'set');
  });

  afterEach(function () {
    this.identifyStub.restore();
    this.registerStub.restore();
    this.nameTagStub.restore();
    this.peopleStub.restore();
    this.options.people = false;
  });

  it('should send an id', function () {
    analytics.identify('id');
    assert(this.identifyStub.calledWith('id'));
  });

  it('should send traits', function () {
    analytics.identify({ trait: true });
    assert(this.registerStub.calledWith({ trait: true }));
  });

  it('should send an id and traits', function () {
    analytics.identify('id', { trait: true });
    assert(this.identifyStub.calledWith('id'));
    assert(this.registerStub.calledWith({ trait: true }));
  });

  it('should use an id as a name tag', function () {
    analytics.identify('id');
    assert(this.nameTagStub.calledWith('id'));
  });

  it('should prefer a username as a name tag', function () {
    analytics.identify('id', { username: 'username' });
    assert(this.nameTagStub.calledWith('username'));
  });

  it('should prefer an email as a name tag', function () {
    analytics.identify('id', {
      username: 'username',
      email: 'name@example.com'
    });
    assert(this.nameTagStub.calledWith('name@example.com'));
  });

  it('should send traits to Mixpanel People', function () {
    this.options.people = true;
    analytics.identify({ trait: true });
    assert(this.peopleStub.calledWith({ trait: true }));
  });

  it('should alias traits', function () {
    var date = new Date();
    analytics.identify({
      created: date,
      email: 'name@example.com',
      firstName: 'first',
      lastName: 'last',
      lastSeen: date,
      name: 'name',
      username: 'username',
      phone: 'phone'
    });
    assert(this.registerStub.calledWith({
      $created: date,
      $email: 'name@example.com',
      $first_name: 'first',
      $last_name: 'last',
      $last_seen: date,
      $name: 'name',
      $username: 'username',
      $phone: 'phone'
    }));
  });

  it('should alias traits to Mixpanel People', function () {
    this.options.people = true;
    var date = new Date();
    analytics.identify({
      created: date,
      email: 'name@example.com',
      firstName: 'first',
      lastName: 'last',
      lastSeen: date,
      name: 'name',
      username: 'username',
      phone: 'phone'
    });
    assert(this.peopleStub.calledWith({
      $created: date,
      $email: 'name@example.com',
      $first_name: 'first',
      $last_name: 'last',
      $last_seen: date,
      $name: 'name',
      $username: 'username',
      $phone: 'phone'
    }));
  });
});

describe('#track', function () {
  beforeEach(function () {
    this.trackStub = sinon.stub(window.mixpanel, 'track');
    this.revenueStub = sinon.stub(window.mixpanel.people, 'track_charge');
  });

  afterEach(function () {
    this.trackStub.restore();
    this.revenueStub.restore();
    this.options.people = false;
  });

  it('should send an event', function () {
    analytics.track('event');
    assert(this.trackStub.calledWith('event'));
  });

  it('should send an event and properties', function () {
    analytics.track('event', { property: true });
    assert(this.trackStub.calledWith('event', { property: true }));
  });

  it('should send a revenue property to Mixpanel People', function () {
    this.options.people = true;
    analytics.track('event', { revenue: 9.99 });
    assert(this.revenueStub.calledWith(9.99));
  });
});

describe('#pageview', function () {
  beforeEach(function () {
    this.pageviewStub = sinon.stub(window.mixpanel, 'track_pageview');
    this.trackStub = sinon.stub(window.mixpanel, 'track');
  });

  afterEach(function () {
    this.pageviewStub.restore();
    this.trackStub.restore();
    this.options.pageview = false;
  });

  it('should send a pageview', function () {
    this.options.pageview = true;
    analytics.pageview();
    assert(this.pageviewStub.called);
  });

  it('shouldnt send an event by default', function () {
    analytics.pageview();
    assert(!this.trackStub.called);
  });

  it('should send a "Loaded a Page" event with default properties', function () {
    this.options.pageview = true;
    analytics.pageview();
    assert(this.trackStub.calledWith('Loaded a Page', {
      url: window.location.href,
      name: document.title
    }));
  });

  it('should send a url', function () {
    this.options.pageview = true;
    analytics.pageview('/path');
    assert(this.trackStub.calledWith('Loaded a Page', {
      url: '/path',
      name: document.title
    }));
  });
});

describe('#alias', function () {
  beforeEach(function () {
    this.stub = sinon.stub(window.mixpanel, 'alias');
  });

  afterEach(function () {
    this.stub.restore();
  });

  it('should send a new id', function () {
    analytics.alias('new');
    assert(this.stub.calledWith('new'));
  });

  it('should send a new and old id', function () {
    analytics.alias('new', 'old');
    assert(this.stub.calledWith('new', 'old'));
  });
});

});
