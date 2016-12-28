/**
 * @file spotify.js
 * Externals (iframe) Media Controller - Wrapper for HTML5 Media API
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

var _Externals2 = require('./Externals');

var _Externals3 = _interopRequireDefault(_Externals2);

var Component = _videoJs2['default'].getComponent('Component');
var Tech = _videoJs2['default'].getComponent('Tech');

/**
 * Externals Media Controller - Wrapper for HTML5 Media API
 *
 * @param {Object=} options Object of option names and values
 * @param {Function=} ready Ready callback function
 * @extends Tech
 * @class Spotify
 */

var Spotify = (function (_Externals) {
  _inherits(Spotify, _Externals);

  function Spotify(options, ready) {
    _classCallCheck(this, Spotify);

    _get(Object.getPrototypeOf(Spotify.prototype), 'constructor', this).call(this, options, ready);
  }

  _createClass(Spotify, [{
    key: 'createEl',
    value: function createEl() {
      var _this = this;

      var source = null;
      if ('string' === typeof this.options_.source) {
        source = this.options_.source;
      } else if ('object' === typeof this.options_.source) {
        source = this.options_.source.src;
      }

      var el_ = _get(Object.getPrototypeOf(Spotify.prototype), 'createEl', this).call(this, 'iframe', {
        width: '100%',
        height: '100%',
        onload: function onload() {
          return _this.onStateChange({ type: 'apiready' });
        },
        src: 'https://embed.spotify.com/?uri=' + source
      }, false);

      el_.firstChild.style.visibility = this.options_.visibility;

      var tagPlayer = (0, _videoJs2['default'])(this.options_.playerId);
      tagPlayer.controls(false);

      return el_;
    }
  }, {
    key: 'addScriptTag',
    value: function addScriptTag() {
      this.initTech();
    }
  }, {
    key: 'isApiReady',
    value: function isApiReady() {
      return true;
    }
  }, {
    key: 'parseSrc',
    value: function parseSrc(src) {
      return src;
    }
  }, {
    key: 'setupTriggers',
    value: function setupTriggers() {
      //SPOTIFY don't have embed api
    }
  }, {
    key: 'ended',
    value: function ended() {
      return false;
    }
  }, {
    key: 'play',
    value: function play() {}
  }, {
    key: 'pause',
    value: function pause() {}

    /**
     * Request to enter fullscreen
     *
     * @method enterFullScreen
     */
  }, {
    key: 'enterFullScreen',
    value: function enterFullScreen() {}

    /**
     * Request to exit fullscreen
     *
     * @method exitFullScreen
     */
  }, {
    key: 'exitFullScreen',
    value: function exitFullScreen() {}
  }, {
    key: 'src',
    value: function src(_src) {
      if (typeof _src !== 'undefined') {
        this.el_.src(_src);
      }
    }
  }]);

  return Spotify;
})(_Externals3['default']);

Spotify.prototype.className_ = 'spotify';

Spotify.prototype.options_ = {
  api: '',
  visibility: 'show'
};

/* Spotify Support Testing -------------------------------------------------------- */

Spotify.isSupported = function () {
  return true;
};

// Add Source Handler pattern functions to this tech
Tech.withSourceHandlers(Spotify);

/*
 * The default native source handler.
 * This simply passes the source to the video element. Nothing fancy.
 *
 * @param  {Object} source   The source object
 * @param  {Flash} tech  The instance of the Flash tech
 */
Spotify.nativeSourceHandler = {};

/**
 * Check if Flash can play the given videotype
 * @param  {String} type    The mimetype to check
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Spotify.nativeSourceHandler.canPlayType = function (source) {
  return source.indexOf('spotify') !== -1;
};

/*
 * Check Spotify can handle the source natively
 *
 * @param  {Object} source  The source object
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Spotify.nativeSourceHandler.canHandleSource = function (source) {

  // If a type was provided we should rely on that
  if (source.type) {
    return Spotify.nativeSourceHandler.canPlayType(source.type);
  } else if (source.src) {
    return Spotify.nativeSourceHandler.canPlayType(source.src);
  }

  return '';
};

Spotify.nativeSourceHandler.handleSource = function (source, tech) {
  tech.src(source.src);
};

/*
 * Clean up the source handler when disposing the player or switching sources..
 * (no cleanup is needed when supporting the format natively)
 */
Spotify.nativeSourceHandler.dispose = function () {};

Spotify.Events = ''.split(',');

// Register the native source handler
Spotify.registerSourceHandler(Spotify.nativeSourceHandler);

Component.registerComponent('Spotify', Spotify);

Tech.registerTech('Spotify', Spotify);

exports['default'] = Spotify;
module.exports = exports['default'];