
var integration = require('../integration');
var load = require('load-script');


/**
 * Expose `HitTail` integration.
 */

var HitTail = module.exports = integration('HitTail')
  .option('siteId', '');


/**
 * Initialize.
 */

HitTail.prototype.initialize = function () {
  this.load(this.ready);
};


/**
 * Load the HitTail library.
 *
 * @param {Function} callback
 */

HitTail.prototype.load = function (callback) {
  var id = this.options.siteId;
  load('//' + id + '.hittail.com/mlt.js', callback);
};
