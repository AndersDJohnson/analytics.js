
var each = require('each');
var integration = require('integration');
var load = require('load-script-once');


/**
 * Expose `LiveChat`.
 */

var LiveChat = module.exports = integration('LiveChat')
  .assumesPageview()
  .readyOnLoad()
  .option('license', '');


/**
 * Exists?
 */

LiveChat.prototype.exists = function () {
  return !! window.__lc;
};


/**
 * Initialize.
 *
 * http://www.livechatinc.com/api/javascript-api
 */

LiveChat.prototype.initialize = function () {
  window.__lc = { license: this.options.license };
  this.load();
};


/**
 * Load.
 *
 * @param {Function} callback
 */

LiveChat.prototype.load = function (callback) {
  load('//cdn.livechatinc.com/tracking.js', callback);
};


/**
 * Identify.
 *
 * @param {String} id (optional)
 * @param {Object} traits (optional)
 * @param {Object} options (optional)
 */

LiveChat.prototype.identify = function (id, traits, options) {
  if (id) traits['User ID'] = id;
  window.LC_API.set_custom_variables(convert(traits));
};


/**
 * Convert a traits object into the format LiveChat requires.
 *
 * @param {Object} traits
 * @return {Array}
 */

function convert (traits) {
  var arr = [];
  each(traits, function (key, value) {
    arr.push({ name: key, value: value });
  });
  return arr;
}
