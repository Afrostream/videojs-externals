/**
 * @file Vimeo.js
 * Externals (iframe) Media Controller - Wrapper for HTML5 Media API
 */
import videojs from 'video.js';
import Externals from './Externals';

const Component = videojs.getComponent('Component');
const Tech = videojs.getComponent('Tech');

/**
 * Externals Media Controller - Wrapper for HTML5 Media API
 *
 * @param {Object=} options Object of option names and values
 * @param {Function=} ready Ready callback function
 * @extends Tech
 * @class Vimeo
 */

class Vimeo extends Externals {
  constructor (options, ready) {
    super(options, ready);
  }

  createEl () {

    let vimeoSource = null;
    if ('string' === typeof this.options_.source) {
      vimeoSource = this.options_.source;
    }
    else if ('object' === typeof this.options_.source) {
      vimeoSource = this.options_.source.src;
    }

    vimeoSource = this.parseSrc(vimeoSource);

    const el_ = super.createEl('div', {
      id: this.options_.techId,
      style: 'width:100%;height:100%;top:0;left:0;position:absolute',
      src: `${this.options_.embed}/${vimeoSource}??api=1&player_id=${this.options_.techId}`
    });

    const tagPlayer = videojs(this.options_.playerId);
    tagPlayer.controls(false);
    return el_;

  }


  parseSrc (src) {
    if (src) {
      // Regex that parse the video ID for any Vimeo URL
      var regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
      var match = src.match(regExp);

      if (match && match[5]) {
        return match[5];
      }
    }
  }

  isApiReady () {
    return window['Vimeo'] && window['Vimeo']['Player'];
  }

  initTech () {
    if (!this.isApiReady()) {
      return;
    }
    let source = null;
    if ('string' === typeof this.options_.source) {
      source = this.options_.source;
    }
    else if ('object' === typeof this.options_.source) {
      source = this.options_.source.src;
    }

    source = this.parseSrc(source);

    const vimOpts = videojs.mergeOptions(this.options_, {
      id: source,
      byline: 0,
      color: '#00adef',
      portrait: 0,
      controls: 0,
      width: this.width(),
      height: this.height()
    });

    this.widgetPlayer = new window.Vimeo.Player(this.options_.techId, vimOpts);
    this.widgetPlayer.ready().then(videojs.bind(this, this.onReady));
    super.initTech();
    this.onStateChange({type: -1});
  }

  setupTriggers () {
    this.widgetPlayer.vjsTech = this;
    for (var i = Vimeo.Events.length - 1; i >= 0; i--) {
      const eventName = Vimeo.Events[i];
      /*jshint loopfunc: true */
      this.widgetPlayer.on(eventName, (data) => {
        this.eventHandler(videojs.mergeOptions({type: eventName}, data));
      });
    }
  }

  onStateChange (event) {
    let state = event.type;
    this.lastState = state;
    super.onStateChange(event);
    if (event.volume) {
      this.volume_ = event.volume;
    }
    if (event.duration) {
      this.duration_ = event.duration;
    }
    if (event.seconds) {
      this.currentTime_ = event.seconds;
    }
    if (event.percent) {
      this.buffered_ = event.percent;
    }
    switch (state) {
      case 'onLoadProgress':
        this.trigger('progress');
        this.trigger('durationchange');
        break;
      case 'playProgress':
        this.trigger('timeupdate');
        break;
    }
    this.updatePaused();
  }

  updateVolume () {
    this.widgetPlayer.getVolume().then((volume)=> {
      this.volume_ = volume;
      this.trigger('volumechange');
    });
  }

  updateEnded () {
    this.widgetPlayer.getEnded().then((ended)=> {
      this.ended_ = ended;
    });
  }

  updatePaused () {
    this.widgetPlayer.getPaused().then((paused)=> {
      this.paused_ = paused;
    });
  }

  updateDuration () {
    this.widgetPlayer.getDuration().then((duration)=> {
      this.duration_ = duration;
    });
  }

  buffered () {
    return videojs.createTimeRange(0, (this.buffered_ * this.duration_) || 0);
  }

  ended () {
    return this.ended_;
  }

  duration () {
    return this.duration_;
  }

  currentTime () {
    return this.currentTime_;
  }


  setCurrentTime (seconds) {
    this.widgetPlayer.setCurrentTime(seconds).then((seconds)=> {
      this.currentTime_ = seconds;
    });
  }

  play () {
    this.widgetPlayer.play();
  }

  pause () {
    this.widgetPlayer.pause();
  }

  paused () {
    return this.paused_;
  }

  muted () {
    return this.muted_;
  }

  volume () {
    return this.volume_;
  }

  setVolume (percentAsDecimal) {
    if (percentAsDecimal !== this.volume_) {
      this.widgetPlayer.setVolume(percentAsDecimal).then(()=> {
        this.updateVolume();
      });
    }
  }

  setMuted (muted) {
    this.muted_ = muted;
    if (muted) {
      this.volumeBefore_ = this.volume_;
    }
    this.setVolume(muted ? 0 : this.volumeBefore_);
  }
}

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
  return (source.indexOf('vimeo') !== -1);
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
Vimeo.nativeSourceHandler.dispose = function () {
};

// Register the native source handler
Vimeo.registerSourceHandler(Vimeo.nativeSourceHandler);

Vimeo.Events = 'loaded,play,ended,timeupdate,progress,seeked,texttrackchange,cuechange,volumechange,error'.split(',');

Component.registerComponent('Vimeo', Vimeo);

Tech.registerTech('Vimeo', Vimeo);


export default Vimeo;
