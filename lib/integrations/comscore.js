
var integration = require('../integration');
var load = require('load-script');


/**
 * Expose `comScore` integration.
 */

var comScore = module.exports = integration('comScore');


/**
 * Default options.
 */

comScore.prototype.defaults = {
  // your comscore `c1` id (you shouldn't need to change this)
  c1: '2',
  // your comscore `c2` id (required)
  c2: ''
};


/**
 * Initialize.
 */

comScore.prototype.initialize = function () {
  window._comscore = window._comscore || [];
  window._comscore.push(this.options);
  this.load(this.ready);
};


/**
 * Load the comScore library.
 *
 * @param {Function} callback
 */

comScore.prototype.load = function (callback) {
  load({
    http: 'http://b.scorecardresearch.com/beacon.js',
    https: 'https://sb.scorecardresearch.com/beacon.js'
  }, callback);
};
