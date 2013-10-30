
var integration = require('integration');
var load = require('load-script');
var noop = function(){};
var onBody = require('on-body');


/**
 * Expose `Awesomatic`.
 */

var Awesomatic = module.exports = integration('Awesomatic')
  .assumesPageview()
  .option('appId', '');


/**
 * Exists?
 */

Awesomatic.prototype.exists = function () {
  return !! window.Awesomatic;
};


/**
 * Initialize.
 */

Awesomatic.prototype.initialize = function () {
  var self = this;
  var id = this.options.appId;
  this.load(function () {
    window.Awesomatic.initialize({ appId: id }, function () {
      self.emit('ready');
    });
  });
};


/**
 * Load the Awesomatic library.
 *
 * @param {Function} callback
 */

Awesomatic.prototype.load = function (callback) {
  var url = 'https://1c817b7a15b6941337c0-dff9b5f4adb7ba28259631e99c3f3691.ssl.cf2.rackcdn.com/gen/embed.js';
  load(url, callback);
};


/**
 * Identify.
 *
 * @param {String} id (optional)
 * @param {Object} traits (optional)
 * @param {Object} options (optional)
 */

Awesomatic.prototype.identify = function (id, traits, options) {
  if (!id && !traits.email) return;
  if (id) traits.userId = id;
  window.Awesomatic.load(traits);
};
