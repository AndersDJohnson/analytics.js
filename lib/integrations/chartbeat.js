
var integration = require('integration');
var onBody = require('on-body');
var load = require('load-script');


/**
 * Expose `Chartbeat`.
 */

var Chartbeat = module.exports = integration('Chartbeat')
  .assumesPageview()
  .readyOnLoad()
  .option('domain', '')
  .option('uid', null);


/**
 * Exists?
 */

Chartbeat.prototype.exists = function () {
  return !! window._sf_async_config;
};


/**
 * Initialize.
 *
 * http://chartbeat.com/docs/configuration_variables/
 */

Chartbeat.prototype.initialize = function () {
  window._sf_async_config = this.options;
  onBody(function () { window._sf_endpt = new Date().getTime(); });
  this.load();
};


/**
 * Load the Chartbeat library.
 *
 * http://chartbeat.com/docs/adding_the_code/
 *
 * @param {Function} callback
 */

Chartbeat.prototype.load = function (callback) {
  load({
    https: 'https://a248.e.akamai.net/chartbeat.download.akamai.com/102508/js/chartbeat.js',
    http: 'http://static.chartbeat.com/js/chartbeat.js'
  }, callback);
};


/**
 * Page.
 *
 * http://chartbeat.com/docs/handling_virtual_page_changes/
 *
 * @param {String} name (optional)
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

Chartbeat.prototype.page = function (name, properties, options) {
  window.pSUPERFLY.virtualPage(properties.path, name || properties.title);
};
