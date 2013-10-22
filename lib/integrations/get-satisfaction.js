
var integration = require('../integration');
var load = require('load-script');
var onBody = require('on-body');


/**
 * Expose `GetSatisfaction` integration.
 *
 * https://console.getsatisfaction.com/start/101022?signup=true#engage
 */

var GetSatisfaction = module.exports = integration('Get Satisfaction')
  .option('widgetId', '');


/**
 * Initialize.
 */

GetSatisfaction.prototype.initialize = function () {
  // append the div that will become the get satisfaction tab
  var widget = this.options.widgetId;
  var div = document.createElement('div');
  var id = div.id = 'getsat-widget-' + widget;
  onBody(function (body) { body.appendChild(div); });

  // usually the snippet is sync, so wait for it before initializing the tab
  var self = this;
  this.load(function () {
    window.GSFN.loadWidget(widget, { containerId: id });
    self.ready();
  });
};


/**
 * Load the Get Satisfaction library.
 *
 * @param {Function} callback
 */

GetSatisfaction.prototype.load = function (callback) {
  load('https://loader.engage.gsfn.us/loader.js', callback);
};
