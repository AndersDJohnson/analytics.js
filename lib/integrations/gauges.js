
var callback = require('callback');
var integration = require('../integration');
var load = require('load-script');


/**
 * Expose `Gauges`.
 */

var Gauges = module.exports = integration('Gauges')
  .assumesPageview()
  .option('siteId', '');


/**
 * Initialize Gauges.
 */

Gauges.prototype.initialize = function () {
  window._gauges = window._gauges || [];
  callback.async(this.ready);
  this.load();
};


/**
 * Load the Gauges library.
 *
 * @param {Function} callback
 */

Gauges.prototype.load = function (callback) {
  var id = this.options.siteId;
  var script = load('//secure.gaug.es/track.js', callback);
  script.id = 'gauges-tracker';
  script.setAttribute('data-site-id', id);
};


/**
 * Page.
 *
 * @param {String} name (optional)
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

Gauges.prototype.page = function (name, properties, options) {
  window._gauges.push(['track']);
};
