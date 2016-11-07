/**
 * @file Deezer.js
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
 * @class Deezer
 */

var Deezer = (function (_Externals) {
  _inherits(Deezer, _Externals);

  function Deezer(options, ready) {
    _classCallCheck(this, Deezer);

    _get(Object.getPrototypeOf(Deezer.prototype), 'constructor', this).call(this, options, ready);
  }

  _createClass(Deezer, [{
    key: 'injectCss',
    value: function injectCss() {
      var css = '.vjs-' + this.className_ + ' > .vjs-poster { display:block; width:50%; background-size:contain; background-position: 0 50%; background-color: #000; }\n    .vjs-' + this.className_ + ' .vjs-tech > .vjs-poster {  display:block; background-color: rgba(76, 50, 65, 0.35);}\n    .vjs-deezer-info{position:absolute;padding:3em 1em 1em 1em;left:50%;top:0;right:0;bottom:0;\n      text-align: center; pointer-events: none; text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.69);}';
      _get(Object.getPrototypeOf(Deezer.prototype), 'injectCss', this).call(this, css);
    }
  }, {
    key: 'createEl',
    value: function createEl() {

      var source = null;
      if ('string' === typeof this.options_.source) {
        source = this.options_.source;
      } else if ('object' === typeof this.options_.source) {
        source = this.options_.source.src;
      }

      source = this.parseSrc(source);

      var el_ = _get(Object.getPrototypeOf(Deezer.prototype), 'createEl', this).call(this, 'div', {
        width: '100%',
        height: '100%',
        src: '//www.deezer.com/plugins/player?type=tracks&id=' + source + '&format=classic&color=007FEB&autoplay=' + this.options_.autoplay + '&playlist=' + this.options_.playList + '&width=100%&height=100%'
      });

      this.infosEl_ = _videoJs2['default'].createEl('div', {
        className: 'vjs-deezer-info'
      });

      var deezerEl = _videoJs2['default'].createEl('div', {
        id: 'dz-root'
      });

      el_.firstChild.style.visibility = this.options_.visibility;
      el_.appendChild(this.infosEl_);
      el_.appendChild(deezerEl);

      return el_;
    }
  }, {
    key: 'isApiReady',
    value: function isApiReady() {
      return window['DZ'] && window['DZ']['player'];
    }
  }, {
    key: 'onStateChange',
    value: function onStateChange(event) {
      var state = event.type;
      switch (state) {
        case -1:
          this.trigger('loadstart');
          this.trigger('loadedmetadata');
          this.trigger('durationchange');
          break;

        case 'player_loaded':
          this.onReady();
          this.updatePause();
          break;

        case 'track_end':
          this.updatePause();
          this.trigger('ended');
          break;

        case 'player_play':
          this.updateDuration();
          this.updatePause();
          this.trigger('play');
          break;

        case 'player_position':
          this.trigger('playing');
          this.currentTime_ = event[0];
          this.duration_ = event[1];
          this.trigger('timeupdate');
          break;

        case 'player_paused':
          this.updatePause();
          this.trigger('pause');
          break;

      }
    }
  }, {
    key: 'parseSrc',
    value: function parseSrc(src) {
      if (src) {
        // Regex that parse the video ID for any Dailymotion URL
        var regExp = /^https?:\/\/(?:www\.)?deezer\.com\/(track|album|playlist)\/(\d+)$/;
        var match = src.match(regExp);

        return match ? match[2] || match[2] : null;
      }
    }
  }, {
    key: 'onReady',
    value: function onReady() {
      _get(Object.getPrototypeOf(Deezer.prototype), 'onReady', this).call(this);
      this.updateDuration();
      this.updateVolume();
      this.updatePoster();
    }
  }, {
    key: 'initTech',
    value: function initTech() {
      DZ.init({
        channelUrl: window.location.protocol + '//' + window.location.hostname,
        appId: this.options_.appId,
        player: {
          container: this.options_.techId,
          width: 800,
          height: 300,
          onload: this.onReady.bind(this)
        }
      });
      this.widgetPlayer = DZ.player;
      _get(Object.getPrototypeOf(Deezer.prototype), 'initTech', this).call(this);
      this.onStateChange({ type: -1 });
    }
  }, {
    key: 'setupTriggers',
    value: function setupTriggers() {
      var _this = this;

      this.widgetPlayer.vjsTech = this;
      for (var i = Deezer.Events.length - 1; i >= 0; i--) {
        var eventName = Deezer.Events[i];
        /*jshint loopfunc: true */
        DZ.Event.subscribe(eventName, function (data, event) {
          _this.eventHandler(_videoJs2['default'].mergeOptions({ type: event || data }, data));
        });
      }
    }
  }, {
    key: 'ended',
    value: function ended() {
      return this.duration() === this.currentTime();
    }

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
    key: 'updatePause',
    value: function updatePause() {
      this.paused_ = !this.widgetPlayer.isPlaying();
    }
  }, {
    key: 'updateDuration',
    value: function updateDuration() {
      var track = this.widgetPlayer.getCurrentTrack();
      this.duration_ = track && track.duration || 0;
      this.trigger('durationchange');
    }
  }, {
    key: 'updateVolume',
    value: function updateVolume() {
      this.volume_ = this.widgetPlayer.getVolume();
      this.trigger('volumechange');
    }
  }, {
    key: 'updatePoster',
    value: function updatePoster() {
      var _this2 = this;

      try {
        //const track = this.widgetPlayer.getCurrentTrack();
        var track = {};
        if ('string' === typeof this.options_.source) {
          track.id = this.options_.source;
        } else if ('object' === typeof this.options_.source) {
          track.id = this.options_.source.src;
        }

        track.id = this.parseSrc(track.id);

        DZ.api('/track/' + track.id, function (response) {
          _this2.setPoster('' + response.album.cover_big);
          _this2.update(response);
        });
      } catch (e) {
        console.log('unable to set poster', e);
      }
    }
  }, {
    key: 'update',
    value: function update(sound) {
      this.infosEl_.innerHTML = sound.title;
    }
  }, {
    key: 'src',
    value: function src(source) {

      if (!source || !source.src) {
        if ('string' === typeof this.options_.source) {
          source = this.options_.source;
        } else if ('object' === typeof this.options_.source) {
          source = this.options_.source.src;
        }

        source = this.parseSrc(source);
      }

      this.widgetPlayer.playTracks([source]);
    }
  }, {
    key: 'duration',
    value: function duration() {
      return this.duration_;
    }
  }, {
    key: 'currentTime',
    value: function currentTime() {
      return this.currentTime_;
    }
  }, {
    key: 'setCurrentTime',
    value: function setCurrentTime(position) {
      this.trigger('seeking');
      this.widgetPlayer.seekTo(position * 1000);
    }
  }, {
    key: 'play',
    value: function play() {
      this.widgetPlayer.play();
      this.updatePause();
    }
  }, {
    key: 'pause',
    value: function pause() {
      this.widgetPlayer.pause();
      this.updatePause();
    }
  }, {
    key: 'paused',
    value: function paused() {
      return this.paused_;
    }
  }, {
    key: 'muted',
    value: function muted() {
      return this.muted_;
    }
  }, {
    key: 'volume',
    value: function volume() {
      return this.volume_;
    }
  }, {
    key: 'setVolume',
    value: function setVolume(percentAsDecimal) {
      if (percentAsDecimal !== this.volume_) {
        this.volume_ = percentAsDecimal;
        this.muted_ = !this.volume_;
        this.widgetPlayer.setVolume(this.volume_);
        this.updateVolume();
      }
    }
  }, {
    key: 'setMuted',
    value: function setMuted(muted) {
      this.muted_ = muted;
      this.widgetPlayer.setMute(this.muted_);
      this.updateVolume();
    }
  }]);

  return Deezer;
})(_Externals3['default']);

Deezer.prototype.className_ = 'deezer';

Deezer.prototype.options_ = {
  api: 'https://cdns-files.dzcdn.net/js/min/dz.js',
  appId: 213642,
  playList: false,
  visibility: 'hidden',
  children: ['subPosterImage']
};

/* Deezer Support Testing -------------------------------------------------------- */

Deezer.isSupported = function () {
  return true;
};

// Add Source Handler pattern functions to this tech
Tech.withSourceHandlers(Deezer);

/*
 * The default native source handler.
 * This simply passes the source to the video element. Nothing fancy.
 *
 * @param  {Object} source   The source object
 * @param  {Flash} tech  The instance of the Flash tech
 */
Deezer.nativeSourceHandler = {};

/**
 * Check if Flash can play the given videotype
 * @param  {String} type    The mimetype to check
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Deezer.nativeSourceHandler.canPlayType = function (source) {
  return source.indexOf('deezer') !== -1;
};

/*
 * Check Deezer can handle the source natively
 *
 * @param  {Object} source  The source object
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Deezer.nativeSourceHandler.canHandleSource = function (source) {

  // If a type was provided we should rely on that
  if (source.type) {
    return Deezer.nativeSourceHandler.canPlayType(source.type);
  } else if (source.src) {
    return Deezer.nativeSourceHandler.canPlayType(source.src);
  }

  return '';
};

Deezer.nativeSourceHandler.handleSource = function (source, tech) {
  tech.src(source.src);
};

/*
 * Clean up the source handler when disposing the player or switching sources..
 * (no cleanup is needed when supporting the format natively)
 */
Deezer.nativeSourceHandler.dispose = function () {};

Deezer.Events = 'player_loaded,player_play,player_paused,player_position,player_buffering,volume_changed,shuffle_changed,mute_changed,track_end,'.split(',');

// Register the native source handler
Deezer.registerSourceHandler(Deezer.nativeSourceHandler);

Component.registerComponent('Deezer', Deezer);

Tech.registerTech('Deezer', Deezer);

exports['default'] = Deezer;
module.exports = exports['default'];