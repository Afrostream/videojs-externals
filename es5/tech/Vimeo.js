/**
 * @file Vimeo.js
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

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

var Component = _videoJs2['default'].getComponent('Component');
var Tech = _videoJs2['default'].getComponent('Tech');

/**
 * Externals Media Controller - Wrapper for HTML5 Media API
 *
 * @param {Object=} options Object of option names and values
 * @param {Function=} ready Ready callback function
 * @extends Tech
 * @class Vimeo
 */

var Vimeo = (function (_Externals) {
    _inherits(Vimeo, _Externals);

    function Vimeo(options, ready) {
        _classCallCheck(this, Vimeo);

        _get(Object.getPrototypeOf(Vimeo.prototype), 'constructor', this).call(this, options, ready);
    }

    _createClass(Vimeo, [{
        key: 'createEl',
        value: function createEl() {

            var vimeoSource = null;
            if ('string' === typeof this.options_.source) {
                vimeoSource = this.options_.source;
            } else if ('object' === typeof this.options_.source) {
                vimeoSource = this.options_.source.src;
            }

            vimeoSource = this.parseSrc(vimeoSource);

            var el_ = _get(Object.getPrototypeOf(Vimeo.prototype), 'createEl', this).call(this, 'iframe', {
                id: this.options_.techId,
                src: this.options_.embed + '/' + vimeoSource + '??api=1&player_id=' + this.options_.techId + '&fullscreen=1&autoplay=' + this.options_.autoplay
            });

            (0, _videoJs2['default'])(this.options_.playerId);
            return el_;
        }
    }, {
        key: 'parseSrc',
        value: function parseSrc(src) {
            if (src) {
                // Regex that parse the video ID for any Vimeo URL
                var regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
                var match = src.match(regExp);

                if (match && match[5]) {
                    return match[5];
                }
            }
        }
    }, {
        key: 'isApiReady',
        value: function isApiReady() {
            return _globalWindow2['default']['Vimeo'] && _globalWindow2['default']['Vimeo']['Player'];
        }
    }, {
        key: 'addScriptTag',
        value: function addScriptTag() {
            var self = this;
            if (_globalWindow2['default']['requirejs']) {
                requirejs([this.options_.api], function (Vimeo) {
                    _globalWindow2['default']['Vimeo'] = { Player: Vimeo };
                    self.initTech();
                });
            } else {
                var r = false,
                    d = document,
                    s = d.getElementsByTagName('head')[0] || d.documentElement;
                var js = d.createElement('script');
                js.async = true;
                js.type = 'text/javascript';
                js.onload = js.onreadystatechange = function () {
                    var rs = this.readyState;
                    if (!r && (!rs || /loaded|complete/.test(rs))) {
                        r = true;
                        // Handle memory leak in IE
                        js.onload = js.onreadystatechange = null;
                        self.initTech();
                    }
                };

                js.src = this.options_.api;
                s.insertBefore(js, s.firstChild);
            }
        }
    }, {
        key: 'initTech',
        value: function initTech() {
            if (!this.isApiReady()) {
                return;
            }
            var source = null;
            if ('string' === typeof this.options_.source) {
                source = this.options_.source;
            } else if ('object' === typeof this.options_.source) {
                source = this.options_.source.src;
            }

            source = this.parseSrc(source);

            var vimOpts = _videoJs2['default'].mergeOptions(this.options_, {
                id: source,
                byline: 0,
                color: '#00adef',
                portrait: 0,
                fullscreen: 1
            });

            this.widgetPlayer = new _globalWindow2['default'].Vimeo.Player(this.options_.techId, vimOpts);
            this.widgetPlayer.ready().then(_videoJs2['default'].bind(this, this.onReady));
            _get(Object.getPrototypeOf(Vimeo.prototype), 'initTech', this).call(this);
            this.onStateChange({ type: -1 });
        }
    }, {
        key: 'onReady',
        value: function onReady() {
            _get(Object.getPrototypeOf(Vimeo.prototype), 'onReady', this).call(this);
            this.onStateChange({ type: 'loaded' });
        }
    }, {
        key: 'setupTriggers',
        value: function setupTriggers() {
            var _this = this;

            this.widgetPlayer.vjsTech = this;

            var _loop = function () {
                var eventName = Vimeo.Events[i];
                /*jshint loopfunc: true */
                _this.widgetPlayer.on(eventName, function (data) {
                    _this.eventHandler(_videoJs2['default'].mergeOptions({ type: eventName }, data));
                });
            };

            for (var i = Vimeo.Events.length - 1; i >= 0; i--) {
                _loop();
            }
        }
    }, {
        key: 'onStateChange',
        value: function onStateChange(event) {
            var state = event.type;
            this.lastState = state;
            _get(Object.getPrototypeOf(Vimeo.prototype), 'onStateChange', this).call(this, event);
            if (event.volume) {
                this.updateVolume();
            }
            if (event.duration && this.duration_ != event.duration) {
                this.duration_ = event.duration;
                this.trigger('durationchange');
            }
            switch (state) {
                case 'loaded':
                    this.trigger('loadedmetadata');
                    this.trigger('durationchange');
                    this.trigger('canplay');
                    break;
                case 'timeupdate':
                    if (event.seconds) {
                        this.currentTime_ = event.seconds;
                        this.trigger('timeupdate');
                    }
                    break;
                case 'progress':
                    if (event.percent) {
                        this.buffered_ = event.percent;
                        this.trigger('progress');
                    }
                    break;
                case 'pause':
                    this.trigger('pause');
                    break;
                case 'play':
                    this.trigger('play');
                    break;
                case 'end':
                    this.updateEnded();
                    break;
            }
            this.updatePaused();
        }
    }, {
        key: 'updateVolume',
        value: function updateVolume() {
            var _this2 = this;

            this.widgetPlayer.getVolume().then(function (volume) {
                _this2.volume_ = volume;
                if (_this2.volume_ != volume) {
                    _this2.trigger('volumechange');
                }
            });
        }
    }, {
        key: 'updateEnded',
        value: function updateEnded() {
            var _this3 = this;

            this.widgetPlayer.getEnded().then(function (ended) {
                _this3.ended_ = ended;
                if (ended) _this3.trigger('ended');
            });
        }
    }, {
        key: 'updatePaused',
        value: function updatePaused() {
            var _this4 = this;

            this.widgetPlayer.getPaused().then(function (paused) {
                if (paused != _this4.paused_) {
                    _this4.paused_ = paused;
                    if (paused) {
                        _this4.trigger('pause');
                    }
                }
            });
        }
    }, {
        key: 'updateDuration',
        value: function updateDuration() {
            var _this5 = this;

            this.widgetPlayer.getDuration().then(function (duration) {
                _this5.duration_ = duration;
            });
        }
    }, {
        key: 'buffered',
        value: function buffered() {
            return _videoJs2['default'].createTimeRange(0, this.buffered_ * this.duration_ || 0);
        }
    }, {
        key: 'ended',
        value: function ended() {
            return this.ended_;
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
        value: function setCurrentTime(seconds) {
            var _this6 = this;

            this.widgetPlayer.setCurrentTime(seconds).then(function (seconds) {
                _this6.currentTime_ = seconds;
            });
        }
    }, {
        key: 'play',
        value: function play() {
            this.widgetPlayer.play();
        }
    }, {
        key: 'pause',
        value: function pause() {
            this.widgetPlayer.pause();
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
            var _this7 = this;

            if (percentAsDecimal !== this.volume_) {
                this.widgetPlayer.setVolume(percentAsDecimal).then(function () {
                    _this7.updateVolume();
                });
            }
        }
    }, {
        key: 'setMuted',
        value: function setMuted(muted) {
            this.muted_ = muted;
            if (muted) {
                this.volumeBefore_ = this.volume_;
            }
            this.setVolume(muted ? 0 : this.volumeBefore_);
        }
    }]);

    return Vimeo;
})(_Externals3['default']);

Vimeo.prototype.options_ = {
    api: '//player.vimeo.com/api/player.js',
    embed: '//player.vimeo.com/video',
    visibility: 'visible'
};

Vimeo.prototype.className_ = 'Vimeo';

/* Vimeo Support Testing -------------------------------------------------------- */

Vimeo.isSupported = function () {
    return true;
};

// Add Source Handler pattern functions to this tech
Tech.withSourceHandlers(Vimeo);

/*
 * The default native source handler.
 * This simply passes the source to the video element. Nothing fancy.
 *
 * @param  {Object} source   The source object
 * @param  {Flash} tech  The instance of the Flash tech
 */
Vimeo.nativeSourceHandler = {};

/**
 * Check if Flash can play the given videotype
 * @param  {String} type    The mimetype to check
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Vimeo.nativeSourceHandler.canPlayType = function (source) {
    return source.indexOf('vimeo') !== -1;
};

/*
 * Check Vimeo can handle the source natively
 *
 * @param  {Object} source  The source object
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Vimeo.nativeSourceHandler.canHandleSource = function (source) {

    // If a type was provided we should rely on that
    if (source.type) {
        return Vimeo.nativeSourceHandler.canPlayType(source.type);
    } else if (source.src) {
        return Vimeo.nativeSourceHandler.canPlayType(source.src);
    }

    return '';
};

Vimeo.nativeSourceHandler.handleSource = function (source, tech) {
    tech.src(source.src);
};

/*
 * Clean up the source handler when disposing the player or switching sources..
 * (no cleanup is needed when supporting the format natively)
 */
Vimeo.nativeSourceHandler.dispose = function () {};

// Register the native source handler
Vimeo.registerSourceHandler(Vimeo.nativeSourceHandler);

Vimeo.Events = 'loaded,play,ended,timeupdate,progress,seeked,texttrackchange,cuechange,volumechange,error'.split(',');

Component.registerComponent('Vimeo', Vimeo);

Tech.registerTech('Vimeo', Vimeo);

exports['default'] = Vimeo;
module.exports = exports['default'];