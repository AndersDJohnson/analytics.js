
var callback = require('callback');
var integration = require('../integration');
var load = require('load-script');


/**
 * Expose `Vero`.
 */

var Vero = module.exports = integration('Vero')
  .option('apiKey', '');


/**
 * Initialize.
 *
 * https://github.com/getvero/vero-api/blob/master/sections/js.md
 */

Vero.prototype.initialize = function () {
  window._veroq || (window._veroq = []);
  push('init', { api_key: this.options.apiKey });
  callback.async(this.ready);
  this.load();
};


/**
 * Load.
 *
 * @param {Function} callback
 */

Vero.prototype.load = function (callback) {
  load('//d3qxef4rp70elm.cloudfront.net/m.js', callback);
};


/**
 * Identify.
 *
 * https://github.com/getvero/vero-api/blob/master/sections/js.md#user-identification
 *
 * @param {String} id (optional)
 * @param {Object} traits (optional)
 * @param {Object} options (optional)
 */

Vero.prototype.identify = function (id, traits, options) {
  if (!id || !traits.email) return; // both required
  if (id) traits.id = id;
  push('user', traits);
};


/**
 * Track.
 *
 * https://github.com/getvero/vero-api/blob/master/sections/js.md#tracking-events
 *
 * @param {String} event
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

Vero.prototype.track = function (event, properties, options) {
  push('track', event, properties);
};


/**
 * Helper to push onto the Vero queue.
 *
 * @param {Mixed} args...
 */

function push (args) {
  args = [].slice.call(arguments);
  window._veroq.push(args);
}
