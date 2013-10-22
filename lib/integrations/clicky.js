
var extend = require('extend');
var integration = require('../integration');
var load = require('load-script');
var user = require('../user');


/**
 * Expose `Clicky` integration.
 *
 * http://clicky.com/help/customization
 */

var Clicky = module.exports = integration('Clicky');


/**
 * Default options.
 */

Clicky.prototype.defaults = {
  siteId: null
};


/**
 * Initialize.
 */

Clicky.prototype.initialize = function () {
  window.clicky_site_ids = window.clicky_site_ids || [];
  window.clicky_site_ids.push(this.options.siteId);
  this.identify(user.id(), user.traits());
  this.load(this.ready);
};


/**
 * Load the Clicky library.
 *
 * @param {Function} callback
 */

Clicky.prototype.load = function (callback) {
  load('//static.getclicky.com/js', callback);
};


/**
 * Identify.
 *
 * @param {String} id (optional)
 * @param {Object} traits (optional)
 * @param {Object} options (optional)
 */

Clicky.prototype.identify = function (id, traits, options) {
  window.clicky_custom = window.clicky_custom || {};
  window.clicky_custom.session = window.clicky_custom.session || {};
  if (id) traits.id = id;
  extend(window.clicky_custom.session, traits);
};


/**
 * Track.
 *
 * http://clicky.com/help/customization#/help/custom/manual
 *
 * @param {String} event
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

Clicky.prototype.track = function (event, properties, options) {
  window.clicky.goal(event, properties.revenue);
};


/**
 * Page.
 *
 * http://clicky.com/help/customization#/help/custom/manual
 *
 * @param {String} name (optional)
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

Clicky.prototype.page = function (name, properties, options) {
  window.clicky.log(properties.path, name || properties.title);
};
