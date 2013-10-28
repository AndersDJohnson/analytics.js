
var integration = require('../integration');
var load = require('load-script-once');


/**
 * Expose `BugHerd`.
 */

var BugHerd = module.exports = integration('BugHerd')
  .assumesPageview()
  .readyOnLoad()
  .option('apiKey', '')
  .option('showFeedbackTab', true);


/**
 * Exists?
 */

BugHerd.prototype.exists = function () {
  return !! window.BugHerdConfig;
};


/**
 * Initialize.
 *
 * http://support.bugherd.com/home
 */

BugHerd.prototype.initialize = function () {
  window.BugHerdConfig = { feedback: { hide: !this.options.showFeedbackTab }};
  this.load();
};


/**
 * Load the BugHerd library.
 *
 * @param {Function} callback
 */

BugHerd.prototype.load = function (callback) {
  load('//www.bugherd.com/sidebarv2.js?apikey=' + this.options.apiKey, callback);
};
