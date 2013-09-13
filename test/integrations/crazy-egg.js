
describe('Crazy Egg', function () {

var analytics = window.analytics || require('analytics')
  , assert = require('assert')
  , equal = require('equals')
  , sinon = require('sinon')
  , when = require('when');

var settings = {
  accountNumber: '00138301'
};

before(function (done) {
  this.timeout(10000);
  this.spy = sinon.spy();
  analytics.ready(this.spy);
  analytics.initialize({ 'Crazy Egg': settings });
  this.integration = analytics._integrations['Crazy Egg'];
  this.options = this.integration.options;
  when(function () { return window.CE2; }, done);
});

describe('#name', function () {
  it('Crazy Egg', function () {
    assert(this.integration.name == 'Crazy Egg');
  });
});

describe('#key', function () {
  it('accountNumber', function () {
    assert(this.integration.key == 'accountNumber');
  });
});

describe('#defaults', function () {
  it('accountNumber', function () {
    assert(this.integration.defaults.accountNumber === '');
  });
});

describe('#initialize', function () {
  it('should call ready', function () {
    assert(this.spy.called);
  });

  it('should store options', function () {
    assert(this.options.accountNumber == settings.accountNumber);
  });
});

});
