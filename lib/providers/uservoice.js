
var alias = require('alias')
  , clone = require('clone')
  , integration = require('../integration')
  , load = require('load-script');


/**
 * Expose `UserVoice` integration.
 */

var UserVoice = module.exports = integration('UserVoice');


/**
 * Required key.
 */

UserVoice.prototype.key = 'widgetId';


/**
 * Default options.
 */

UserVoice.prototype.defaults = {
  // your uservoice widget id (required)
  widgetId: '',
  // your uservoice forum id (required)
  forumId: null,
  // tab customization options
  mode: 'full',
  primaryColor: '#cc6d00',
  linkColor: '#007dbf',
  defaultMode: 'support',
  tabLabel: 'Feedback & Support',
  tabColor: '#cc6d00',
  tabPosition: 'middle-right',
  tabInverted: false
};


/**
 * Initialize.
 *
 * @param {Object} options
 * @param {Function} ready
 */

UserVoice.prototype.initialize = function (options, ready) {
  window.UserVoice || (window.UserVoice = []);
  ready();

  // actually wait for load, so we can show the tab for classic uservoice
  load('//widget.uservoice.com/' + options.widgetId + '.js', function () {
    if (window.UserVoice.newShowTab) return;
    window.UserVoice.showTab('classic_widget', formatOptions(options));
  });

  // needs to be available on window for public api
  window.showClassicWidget = showClassicWidget;
};


/**
 * Identify.
 *
 * @param {String} id (optional)
 * @param {Object} traits (optional)
 * @param {Object} options (optional)
 */

UserVoice.prototype.identify = function (id, traits, options) {
  if (id) traits.id = id;
  window.UserVoice.push(['setCustomFields', traits]);
};


/**
 * Format the options for UserVoice.
 *
 * @param {Object} options
 * @return {Object}
 */

function formatOptions (options) {
  var cloned = clone(options);
  alias(cloned, {
    forumId: 'forum_id',
    primaryColor: 'primary_color',
    linkColor: 'link_color',
    defaultMode: 'default_mode',
    tabLabel: 'tab_label',
    tabColor: 'tab_color',
    tabPosition: 'tab_position',
    tabInverted: 'tab_inverted'
  });
  return cloned;
}


/**
 * Show the classic version of the UserVoice widget. This method is usually part
 * of UserVoice classic's public API.
 *
 * @param {String} type ('showTab' or 'showLightbox')
 * @param {Object} options (optional)
 */

function showClassicWidget (type, options) {
  type || (type = 'showLightbox');
  window.UserVoice.push([type, 'classic_widget', options]);
}
