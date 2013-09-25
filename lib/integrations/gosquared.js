
var callback = require('callback')
  , integration = require('../integration')
  , load = require('load-script')
  , onBody = require('on-body')
  , user = require('../user');


/**
 * Expose `GoSquared` integration.
 *
 * http://www.gosquared.com/support
 */

var GoSquared = module.exports = integration('GoSquared');


/**
 * Required key.
 */

GoSquared.prototype.key = 'siteToken';


/**
 * Default options.
 */

GoSquared.prototype.defaults = {
  // your gosquared site token (required)
  siteToken: ''
};


/**
 * Initialize.
 *
 * @param {Object} options
 * @param {Function} ready
 */

GoSquared.prototype.initialize = function (options, ready) {
  // gosquared assumes a body in their script, so we need this wrapper
  var self = this;
  onBody(function () {
    window.GoSquared = {};
    window.GoSquared.acct = options.siteToken;
    window.GoSquared.q = [];
    window._gstc_lt = new Date().getTime(); // time from `load`

    // identify since gosquared doesn't have an async identify api
    self.identify(user.id(), user.traits());

    load('//d1l6p2sc9645hc.cloudfront.net/tracker.js');
    callback.async(ready);
  });
};


/**
 * Identify.
 *
 * https://www.gosquared.com/customer/portal/articles/612063-tracker-functions
 *
 * @param {String} id (optional)
 * @param {Object} traits (optional)
 * @param {Object} options (optional)
 */

GoSquared.prototype.identify = function (id, traits, options) {
  window.GoSquared.UserName = id;
  window.GoSquared.VisitorName = traits.email || traits.username || id;
  if (id) traits.userID = id; // gosquared recognizes this in `Visitor`
  window.GoSquared.Visitor = traits;
};


/**
 * Track.
 *
 * https://www.gosquared.com/customer/portal/articles/609683-event-tracking
 *
 * @param {String} event
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 */

GoSquared.prototype.track = function (event, properties, options) {
  window.GoSquared.q.push(['TrackEvent', event, properties]);
};


/**
 * Pageview.
 *
 * https://www.gosquared.com/customer/portal/articles/612063-tracker-functions
 *
 * @param {String} url (optional)
 */

GoSquared.prototype.pageview = function (url) {
  window.GoSquared.q.push(['TrackView', url]);
};
