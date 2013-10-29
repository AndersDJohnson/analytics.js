
var integration = require('../integration');
var load = require('load-script-once');


/**
 * Expose `PerfectAudience`.
 */

var PerfectAudience = module.exports = integration('Perfect Audience')
  .assumesPageview()
  .readyOnLoad()
  .option('siteId', '');


/**
 * Exists?
 */

PerfectAudience.prototype.exists = function () {
  return !! window._pa;
};


/**
 * Initialize.
 *
 * https://www.perfectaudience.com/docs#javascript_api_autoopen
 */

PerfectAudience.prototype.initialize = function () {
  window._pa = {};
  this.load();
};


/**
 * Load.
 *
 * @param {Function} callback
 */

PerfectAudience.prototype.load = function (callback) {
  var id = this.options.siteId;
  load('//tag.perfectaudience.com/serve/' + id + '.js', callback);
};


/**
 * Track.
 *
 * @param {String} event
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

PerfectAudience.prototype.track = function (event, properties, options) {
  window._pa.track(event, properties);
};
