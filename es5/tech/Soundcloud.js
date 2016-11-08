/**
 * @file Soundcloud.js
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
 * @class Soundcloud
 */

var Soundcloud = (function (_Externals) {
  _inherits(Soundcloud, _Externals);

  function Soundcloud(options, ready) {
    _classCallCheck(this, Soundcloud);

    _get(Object.getPrototypeOf(Soundcloud.prototype), 'constructor', this).call(this, options, ready);
  }

  _createClass(Soundcloud, [{
    key: 'injectCss',
    value: function injectCss() {
      var css = '.vjs-' + this.className_ + ' > .vjs-poster { display:block; width:50%; background-size:contain; background-position: 0 50%; }\n    .vjs-' + this.className_ + ' .vjs-tech > .vjs-poster {  display:block; background-color: rgba(76, 50, 65, 0.35);}\n    .vjs-has-started .vjs-poster {display:block;}\n    .vjs-soundcloud-info{position:absolute;display: flex;justify-content: center;align-items: center;left:50%;top:0;right:0;bottom:0;\n      text-align: center; pointer-events: none; text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.69);}';
      _get(Object.getPrototypeOf(Soundcloud.prototype), 'injectCss', this).call(this, css);
    }
  }, {
    key: 'createEl',
    value: function createEl() {
      var soundcloudSource = null;
      if ('string' === typeof this.options_.source) {
        soundcloudSource = this.options_.source;
      } else if ('object' === typeof this.options_.source) {
        soundcloudSource = this.options_.source.src;
      }

      var el_ = _get(Object.getPrototypeOf(Soundcloud.prototype), 'createEl', this).call(this, 'iframe', {
        width: '100%',
        height: '100%',
        src: 'https://w.soundcloud.com/player/?url=' + soundcloudSource + '&auto_play=' + this.options_.autoplay + '\n      &buying=false&liking=false&sharing=false&show_comments=false&show_playcount=false&show_user=false'
      });

      this.infosEl_ = _videoJs2['default'].createEl('div', {
        className: 'vjs-soundcloud-info'
      });

      el_.firstChild.style.visibility = this.options_.visibility;
      el_.appendChild(this.infosEl_);

      return el_;
    }
  }, {
    key: 'isApiReady',
    value: function isApiReady() {
      return window['SC'];
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

        case SC.Widget.Events.READY:
          this.updatePause();
          this.onReady();
          break;

        case SC.Widget.Events.FINISH:
          this.updatePause();
          this.trigger('ended');
          break;

        case SC.Widget.Events.PLAY:
          this.updatePause();
          this.trigger('play');
          break;

        case SC.Widget.Events.PLAY_PROGRESS:
          this.trigger('playing');
          this.currentTime_ = this.duration_ * 1000 * event.relativePosition / 1000;
          //this.trigger('timeupdate');
          break;

        case SC.Widget.Events.PAUSE:
          this.updatePause();
          this.trigger('pause');
          break;

        case SC.Widget.Events.SEEK:
          this.trigger('seeked');
          break;

        case SC.Widget.Events.LOAD_PROGRESS:
          this.trigger('timeupdate');
          break;

        case SC.Widget.Events.ERROR:
          this.onPlayerError();
          break;
      }
    }
  }, {
    key: 'parseSrc',
    value: function parseSrc(src) {
      if (src) {
        // Regex that parse the video ID for any Dailymotion URL
        var regExp = /^(https?:\/\/)?(www.|api.)?soundcloud.com\//i;
        var match = src.match(regExp);

        return match ? match[5] || match[3] : null;
      }
    }
  }, {
    key: 'onReady',
    value: function onReady() {
      _get(Object.getPrototypeOf(Soundcloud.prototype), 'onReady', this).call(this);
      this.updateDuration();
      this.updateVolume();
      this.updatePoster();
    }
  }, {
    key: 'initTech',
    value: function initTech() {
      this.widgetPlayer = SC.Widget(this.options_.techId);
      _get(Object.getPrototypeOf(Soundcloud.prototype), 'initTech', this).call(this);
    }
  }, {
    key: 'setupTriggers',
    value: function setupTriggers() {
      var _this = this;

      this.widgetPlayer.vjsTech = this;

      var _loop = function () {
        var eventName = Soundcloud.Events[i];
        /*jshint loopfunc: true */
        _this.widgetPlayer.bind(eventName, function (data) {
          _this.eventHandler(_videoJs2['default'].mergeOptions({ type: eventName }, data));
        });
      };

      for (var i = Soundcloud.Events.length - 1; i >= 0; i--) {
        _loop();
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
    value: function enterFullScreen() {
      this.widgetPlayer.webkitEnterFullScreen();
    }

    /**
     * Request to exit fullscreen
     *
     * @method exitFullScreen
     */
  }, {
    key: 'exitFullScreen',
    value: function exitFullScreen() {
      this.widgetPlayer.webkitExitFullScreen();
    }
  }, {
    key: 'updatePause',
    value: function updatePause() {
      var _this2 = this;

      this.widgetPlayer.isPaused(function (paused) {
        _this2.paused_ = paused;
      });
    }
  }, {
    key: 'updateDuration',
    value: function updateDuration() {
      var _this3 = this;

      this.widgetPlayer.getDuration(function (duration) {
        _this3.duration_ = duration / 1000;
        _this3.trigger('durationchange');
      });
    }
  }, {
    key: 'updateVolume',
    value: function updateVolume() {
      var _this4 = this;

      this.widgetPlayer.getVolume(function (volume) {
        _this4.volume_ = volume;
        _this4.trigger('volumechange');
      });
    }
  }, {
    key: 'updatePoster',
    value: function updatePoster() {
      var _this5 = this;

      try {
        this.widgetPlayer.getCurrentSound(function (sound) {
          if (!sound) {
            return;
          }
          _this5.setPoster(sound['artwork_url'].replace('large.jpg', 't500x500.jpg'));
          _this5.subPosterImage.update(sound['waveform_url'].replace('wis', 'w1').replace('json', 'png'));
          _this5.update(sound);
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
    value: function src(_src) {
      this.widgetPlayer.load(_src, {
        'auto_play': this.options_.autoplay
      }, this.onReady.bind(this));
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
      this.widgetPlayer.setVolume(this.muted_ ? 0 : this.volume_);
      this.updateVolume();
    }
  }]);

  return Soundcloud;
})(_Externals3['default']);

Soundcloud.prototype.className_ = 'soundcloud';

Soundcloud.prototype.options_ = {
  api: '//w.soundcloud.com/player/api.js',
  visibility: 'hidden',
  children: ['subPosterImage']
};

/* Soundcloud Support Testing -------------------------------------------------------- */

Soundcloud.isSupported = function () {
  return true;
};

// Add Source Handler pattern functions to this tech
Tech.withSourceHandlers(Soundcloud);

/*
 * The default native source handler.
 * This simply passes the source to the video element. Nothing fancy.
 *
 * @param  {Object} source   The source object
 * @param  {Flash} tech  The instance of the Flash tech
 */
Soundcloud.nativeSourceHandler = {};

/**
 * Check if Flash can play the given videotype
 * @param  {String} type    The mimetype to check
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Soundcloud.nativeSourceHandler.canPlayType = function (source) {
  return source.indexOf('soundcloud') !== -1;
};

/*
 * Check Soundcloud can handle the source natively
 *
 * @param  {Object} source  The source object
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Soundcloud.nativeSourceHandler.canHandleSource = function (source) {

  // If a type was provided we should rely on that
  if (source.type) {
    return Soundcloud.nativeSourceHandler.canPlayType(source.type);
  } else if (source.src) {
    return Soundcloud.nativeSourceHandler.canPlayType(source.src);
  }

  return '';
};

Soundcloud.nativeSourceHandler.handleSource = function (source, tech) {
  tech.src(source.src);
};

/*
 * Clean up the source handler when disposing the player or switching sources..
 * (no cleanup is needed when supporting the format natively)
 */
Soundcloud.nativeSourceHandler.dispose = function () {};

Soundcloud.Events = 'ready,play,playProgress,loadProgress,pause,seek,finish,error'.split(',');

// Register the native source handler
Soundcloud.registerSourceHandler(Soundcloud.nativeSourceHandler);

Component.registerComponent('Soundcloud', Soundcloud);

Tech.registerTech('Soundcloud', Soundcloud);

exports['default'] = Soundcloud;
module.exports = exports['default'];