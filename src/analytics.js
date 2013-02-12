//     Analytics.js 0.6.0
//     (c) 2013 Segment.io Inc.
//     Analytics.js may be freely distributed under the MIT license.

var each      = require('each')
  , clone     = require('clone')
  , providers = require('./providers')
  , utils     = require('./utils');


module.exports = Analytics;

function Analytics () {

  this.initializableProviders = {};

  // Cache the `userId` when a user is identified.
  this.userId = null;

  // Store the date when the page loaded, for services that depend on it.
  this.date = new Date();

  // Store window.onload state so that analytics that rely on it can be loaded
  // even after onload fires.
  this.loaded = false;

  // Whether analytics.js has been initialized with providers.
  this.initialized = false;

  // A queue for storing `ready` callback functions to get run when
  // analytics have been initialized.
  this.readyCallbacks = [];

  // The amount of milliseconds to wait for requests to providers to clear
  // before navigating away from the current page.
  this.timeout = 300,

  this.providers = [];
}


// Adds a provider to the list of available providers that can be
// initialized.
Analytics.prototype.addProvider = function (name, provider) {

  this.initializableProviders[name] = provider;
};


// Initialize
// ----------

// Call **initialize** to setup analytics.js before identifying or
// tracking any users or events. Here's what a call to **initialize**
// might look like:
//
//     analytics.initialize({
//         'Google Analytics' : 'UA-XXXXXXX-X',
//         'Segment.io'       : 'XXXXXXXXXXX',
//         'KISSmetrics'      : 'XXXXXXXXXXX'
//     });
//
// * `providers` is a dictionary of the providers you want to enabled.
// The keys are the names of the providers and their values are either
// an api key, or dictionary of extra settings (including the api key).
Analytics.prototype.initialize = function (providers) {

  // Reset our state.
  this.providers = [];
  this.userId = null;

  var self = this;

  // Initialize each provider with the proper settings, and copy the
  // provider into `this.providers`.
  each(providers, function (key, settings) {
    var provider = self.initializableProviders[key];
    if (!provider) throw new Error('Could not find a provider named "'+key+'"');

    provider.initialize(settings);
    self.providers.push(provider);
  });

  // Update the initialized state that other methods rely on.
  this.initialized = true;

  // Run any callbacks on our `readyCallbacks` queue.
  each(this.readyCallbacks, function (callback) {
    callback();
  });

  // Try to use id and event parameters from the url
  var userId = utils.getUrlParameter(window.location.search, 'ajs_uid');
  if (userId) this.identify(userId);

  var event = utils.getUrlParameter(window.location.search, 'ajs_event');
  if (event) this.track(event);
};


// Identify
// --------
// Identifying a user ties all of their actions to an ID you recognize
// and records properties about a user. An example identify:
//
//     analytics.identify('4d3ed089fb60ab534684b7e0', {
//         name  : 'Achilles',
//         email : 'achilles@segment.io',
//         age   : 23
//     });
//
// * `userId` (optional) is the ID you know the user by. Ideally this
// isn't an email, because the user might be able to change their email
// and you don't want that to affect your analytics.
//
// * `traits` (optional) is a dictionary of traits to tie your user.
// Things like `name`, `age` or `friendCount`. If you have them, you
// should always store a `name` and `email`.
//
// * `callback` (optional) is a function to call after the a small
// timeout to give the identify requests a chance to be sent.
Analytics.prototype.identify = function (userId, traits, callback) {
  if (!this.initialized) return;

  // Allow for not passing traits, but passing a callback.
  if (utils.isFunction(traits)) {
    callback = traits;
    traits = null;
  }

  // Allow for identifying traits without setting a `userId`, for
  // anonymous users whose traits you learn.
  if (utils.isObject(userId)) {
    if (traits && utils.isFunction(traits)) callback = traits;
    traits = userId;
    userId = null;
  }

  // Cache the `userId`, or use saved one.
  if (userId !== null)
    this.userId = userId;
  else
    userId = this.userId;

  // Call `identify` on all of our enabled providers that support it.
  each(this.providers, function (provider) {
    if (provider.identify) provider.identify(userId, clone(traits));
  });

  if (callback && utils.isFunction(callback)) {
    setTimeout(callback, this.timeout);
  }
};


// Track
// -----
// Whenever a visitor triggers an event on your site that you're
// interested in, you'll want to track it. An example track:
//
//     analytics.track('Added a Friend', {
//         level  : 'hard',
//         volume : 11
//     });
//
// * `event` is the name of the event. The best names are human-readable
// so that your whole team knows what they mean when they analyze your
// data.
//
// * `properties` (optional) is a dictionary of properties of the event.
// Property keys are all camelCase (we'll alias to non-camelCase for
// you automatically for providers that require it).
//
// * `callback` (optional) is a function to call after the a small
// timeout to give the track requests a chance to be sent.
Analytics.prototype.track = function (event, properties, callback) {
  if (!this.initialized) return;

  // Allow for not passing properties, but passing a callback.
  if (utils.isFunction(properties)) {
    callback = properties;
    properties = null;
  }

  // Call `track` on all of our enabled providers that support it.
  each(this.providers, function (provider) {
    if (provider.track) provider.track(event, clone(properties));
  });

  if (callback && utils.isFunction(callback)) {
    setTimeout(callback, this.timeout);
  }
};


// ### trackLink
//
// A helper for tracking outbound links that would normally leave the
// page before the track calls went out. It works by wrapping the calls
// in as short of a timeout as possible to fire the track call, because
// [response times matter](http://theixdlibrary.com/pdf/Miller1968.pdf).
//
// * `links` is either a single link DOM element, or an array of link
// elements like jQuery gives you.
//
// * `event` and `properties` are passed directly to `analytics.track`
// and take the same options. `properties` can also be a function that
// will get passed the link that was clicked, and should return a
// dictionary of event properties.
Analytics.prototype.trackLink = function (links, event, properties) {
  if (!links) return;

  // Turn a single link into an array so that we're always handling
  // arrays, which allows for passing jQuery objects.
  if (utils.isElement(links)) links = [links];

  var self  = this;

  // Bind to all the links in the array.
  each(links, function (el) {

    utils.bind('click', function (e) {

      // Allow for properties to be a function. And pass it the
      // link element that was clicked.
      if (utils.isFunction(properties)) properties = properties(el);

      // Fire a normal track call.
      self.track(event, properties);

      // To justify us preventing the default behavior we must:
      //
      // * Have an `href` to use.
      // * Not have a `target="_blank"` attribute.
      // * Not have any special keys pressed, because they might
      // be trying to open in a new tab, or window, or download
      // the asset.
      //
      // This might not cover all cases, but we'd rather throw out
      // an event than miss a case that breaks the experience.
      if (el.href && el.target !== '_blank' && !utils.isMeta(e)) {

        // Prevent the link's default redirect in all the sane
        // browsers, and also IE.
        if (e.preventDefault)
            e.preventDefault();
        else
            e.returnValue = false;

        // Navigate to the url after a small timeout, giving the
        // providers time to track the event.
        setTimeout(function () {
            window.location.href = el.href;
        }, self.timeout);
      }
    });
  });
};


// ### trackForm
//
// Similar to `trackClick`, this is a helper for tracking form
// submissions that would normally leave the page before a track call
// can be sent. It works by preventing the default submit, sending a
// track call, and then submitting the form programmatically.
//
// * `forms` is either a single form DOM element, or an array of
// form elements like jQuery gives you.
//
// * `event` and `properties` are passed directly to `analytics.track`
// and take the same options. `properties` can also be a function that
// will get passed the form that was submitted, and should return a
// dictionary of event properties.
Analytics.prototype.trackForm = function (form, event, properties) {
  if (!form) return;

  // Turn a single element into an array so that we're always handling
  // arrays, which allows for passing jQuery objects.
  if (utils.isElement(form)) form = [form];

  var self = this;

  each(form, function (el) {

    utils.bind(el, 'submit', function (e) {
      // Allow for properties to be a function. And pass it the
      // form element that was submitted.
      if (utils.isFunction(properties)) properties = properties(el);

      // Fire a normal track call.
      self.track(event, properties);

      // Prevent the form's default submit in all the sane
      // browsers, and also IE.
      if (e.preventDefault)
        e.preventDefault();
      else
        e.returnValue = false;

      // Submit the form after a small timeout, giving the event
      // time to get fired.
      setTimeout(function () {
        el.submit();
      }, self.timeout);
    });
  });
};


// Pageview
// --------
// For single-page applications where real page loads don't happen, the
// **pageview** method simulates a page loading event for all providers
// that track pageviews and support it. This is the equivalent of
// calling `_gaq.push(['trackPageview'])` in Google Analytics.
//
// **pageview** is _not_ for sending events about which pages in your
// app the user has loaded. For that, use a regular track call like:
// `analytics.track('View Signup Page')`. Or, if you think you've come
// up with a badass abstraction, submit a pull request!
//
// * `url` (optional) is the url path that you want to be associated
// with the page. You only need to pass this argument if the URL hasn't
// changed but you want to register a new pageview.
Analytics.prototype.pageview = function (url) {
  if (!this.initialized) return;

  // Call `pageview` on all of our enabled providers that support it.
  each(this.providers, function (provider) {
    if (provider.pageview) provider.pageview(url);
  });
};


// Alias
// -----
// Alias combines two previously unassociated user identities. This
// comes in handy if the same user visits from two different devices and
// you want to combine their history. Some providers also don't alias
// automatically for you when an anonymous user signs up (like
// Mixpanel), so you need to call `alias` manually right after sign up
// with their brand new `userId`.
//
// * `newId` is the new ID you want to associate the user with.
//
// * `originalId` (optional) is the original ID that the user was
// recognized by. This defaults to the currently identified user's ID if
// there is one. In most cases you don't need to pass this argument.
Analytics.prototype.alias = function (newId, originalId) {
  if (!this.initialized) return;

  // Call `alias` on all of our enabled providers that support it.
  each(this.providers, function (provider) {
    if (provider.alias) provider.alias(newId, originalId);
  });
};


// Ready
// -----
// Ready lets you pass in a callback that will get called when your
// analytics services have been initialized. It's like jQuery's `ready`
// expect for analytics instead of the DOM.
Analytics.prototype.ready = function (callback) {
  // Not a function, get out of here.
  if (!utils.isFunction(callback)) return;

    // If we're already initialized, do it right away. Otherwise, add it
    // to the queue for when we do get initialized.
  if (this.initialized) {
    callback();
  } else {
    this.readyCallbacks.push(callback);
  }
};


Analytics.prototype.trackClick = Analytics.prototype.trackLink;
Analytics.prototype.trackSubmit = Analytics.prototype.trackForm;
