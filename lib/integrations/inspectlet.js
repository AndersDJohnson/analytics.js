
var integration = require('integration');
var alias = require('alias');
var clone = require('clone');
var load = require('load-script-once');
var push = require('global-queue')('__insp');


/**
 * Expose `Inspectlet`.
 */

var Inspectlet = module.exports = integration('Inspectlet')
  .assumesPageview()
  .readyOnLoad()
  .option('wid', '');


/**
 * Exists?
 */

Inspectlet.prototype.exists = function () {
  return !! window.__insp;
};


/**
 * Initialize.
 *
 * https://www.inspectlet.com/dashboard/embedcode/1492461759/initial
 */

Inspectlet.prototype.initialize = function () {
  push('wid', this.options.wid);
  this.load();
};


/**
 * Load the Inspectlet library.
 *
 * @param {Function} callback
 */

Inspectlet.prototype.load = function (callback) {
  load('//www.inspectlet.com/inspectlet.js', callback);
};
