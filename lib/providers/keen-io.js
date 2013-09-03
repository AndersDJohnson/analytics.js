
var integration = require('../integration')
  , load = require('load-script');


/**
 * Expose `Keen IO` integration.
 */

var Keen = module.exports = integration('Keen IO');


/**
 * Default options.
 */

Keen.prototype.defaults = {
  // your keen io project id (required)
  projectId: '',
  // your keen io write key (required)
  writeKey: '',
  // your keen io read key
  readKey: '',
  // whether or not to send `pageview` calls on to keen io
  pageview: true,
  // whether or not to track an initial pageview on `initialize`
  initialPageview: true
};


/**
 * Initialize.
 *
 * https://keen.io/docs/
 *
 * @param {Object} options
 * @param {Function} ready
 */

Keen.prototype.initialize = function (options, ready) {
  window.Keen = window.Keen||{configure:function(e){this._cf=e},addEvent:function(e,t,n,i){this._eq=this._eq||[],this._eq.push([e,t,n,i])},setGlobalProperties:function(e){this._gp=e},onChartsReady:function(e){this._ocrq=this._ocrq||[],this._ocrq.push(e)}};
  window.Keen.configure({
    projectId: options.projectId,
    writeKey: options.writeKey,
    readKey: options.readKey
  });
  ready();

  if (options.initialPageview) this.pageview();
  load('//dc8na2hxrj29i.cloudfront.net/code/keen-2.1.0-min.js');
};


/**
 * Identify.
 *
 * @param {String} id (optional)
 * @param {Object} traits (optional)
 * @param {Object} options (optional)
 */

Keen.prototype.identify = function (id, traits, options) {
  var globals = {};
  if (id) globals.userId = id;
  if (traits) globals.traits = traits;
  window.Keen.setGlobalProperties(function() {
    return { user: globals };
  });
};


/**
 * Track.
 *
 * @param {String} event
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

Keen.prototype.track = function (event, properties, options) {
  window.Keen.addEvent(event, properties);
};


/**
 * Pageview.
 *
 * @param {String} url (optional)
 */

Keen.prototype.pageview = function (url) {
  if (!this.options.pageview) return;
  var properties = {
    url: url || document.location.href,
    name: document.title
  };
  this.track('Loaded a Page', properties);
};
