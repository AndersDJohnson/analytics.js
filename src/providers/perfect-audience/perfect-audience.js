// Perfect Audience
// ----------------
// [Documentation](https://www.perfectaudience.com/docs#javascript_api_autoopen)

var utils = require('../../utils');


module.exports = PerfectAudience;

function PerfectAudience () {
  this.settings = {
    siteId : null
  };
}


PerfectAudience.prototype.initialize = function (settings) {

  settings = utils.resolveSettings(settings, 'siteId');
  utils.extend(this.settings, settings);

  (function() {
    window._pa = window._pa || {};
    var pa = document.createElement('script'); pa.type = 'text/javascript'; pa.async = true;
    pa.src = ('https:' === document.location.protocol ? 'https:' : 'http:') + "//tag.perfectaudience.com/serve/" + settings.siteId + ".js";
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(pa, s);
  })();
};


PerfectAudience.prototype.track = function (event, properties) {
  // We're not guaranteed a track method.
  if (!window._pa.track) return;

  window._pa.track(event, properties);
};
