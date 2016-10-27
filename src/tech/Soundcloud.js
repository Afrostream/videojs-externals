/**
 * @file Soundcloud.js
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
 * @class Soundcloud
 */

class Soundcloud extends Externals {
  constructor (options, ready) {
    super(options, ready);
  }

  injectCss () {
    let css = `.vjs-${this.className_} > .vjs-poster { display:block; width:50%; background-size:contain; background-position: 0 50%; background-color: transparent; }
    .vjs-${this.className_} .vjs-tech > .vjs-poster {  display:block; background-color: rgba(76, 50, 65, 0.35);}
    .vjs-soundcloud-info{position:absolute;padding:3em 1em 1em 1em;left:50%;top:0;right:0;bottom:0;
      text-align: center; pointer-events: none; text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.69);}`;
    super.injectCss(css);
  }

  createEl () {
    let soundcloudSource = null;
    if ('string' === typeof this.options_.source) {
      soundcloudSource = this.options_.source;
    }
    else if ('object' === typeof this.options_.source) {
      soundcloudSource = this.options_.source.src;
    }

    const el_ = super.createEl('iframe', {
      width: '100%',
      height: '100%',
      src: `https://w.soundcloud.com/player/?url=${soundcloudSource}&auto_play=${this.options_.autoplay}
      &buying=false&liking=false&sharing=false&show_comments=false&show_playcount=false&show_user=false`
    });

    this.infosEl_ = videojs.createEl('div', {
      className: 'vjs-soundcloud-info'
    });

    el_.firstChild.style.visibility = this.options_.visibility;
    el_.appendChild(this.infosEl_);

    return el_;
  }

  isApiReady () {
    return window['SC'];
  }

  onStateChange (event) {
    let state = event.type;
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
        this.currentTime_ = ((this.duration_ * 1000) * event.relativePosition ) / 1000;
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

  parseSrc (src) {
    if (src) {
      // Regex that parse the video ID for any Dailymotion URL
      var regExp = /^(https?:\/\/)?(www.|api.)?soundcloud.com\//i;
      var match = src.match(regExp);

      return match ? match[5] || match[3] : null;
    }
  }

  onReady () {
    super.onReady();
    this.updateDuration();
    this.updateVolume();
    this.updatePoster();
  }

  initTech () {
    this.widgetPlayer = SC.Widget(this.options_.techId);
    super.initTech();
  }

  setupTriggers () {
    this.widgetPlayer.vjsTech = this;
    for (var i = Soundcloud.Events.length - 1; i >= 0; i--) {
      const eventName = Soundcloud.Events[i];
      /*jshint loopfunc: true */
      this.widgetPlayer.bind(eventName, (data) => {
        this.eventHandler(videojs.mergeOptions({type: eventName}, data));
      });
    }
  }

  ended () {
    return this.duration() === this.currentTime();
  }

  /**
   * Request to enter fullscreen
   *
   * @method enterFullScreen
   */
  enterFullScreen () {
    this.widgetPlayer.webkitEnterFullScreen();
  }

  /**
   * Request to exit fullscreen
   *
   * @method exitFullScreen
   */
  exitFullScreen () {
    this.widgetPlayer.webkitExitFullScreen();
  }

  updatePause () {
    this.widgetPlayer.isPaused((paused)=> {
      this.paused_ = paused;
    });
  }

  updateDuration () {
    this.widgetPlayer.getDuration((duration)=> {
      this.duration_ = duration / 1000;
      this.trigger('durationchange');
    });
  }

  updateVolume () {
    this.widgetPlayer.getVolume((volume)=> {
      this.volume_ = volume;
      this.trigger('volumechange');
    });
  }

  updatePoster () {
    try {
      this.widgetPlayer.getCurrentSound((sound)=> {
        if (!sound) {
          return;
        }
        this.setPoster(sound['artwork_url'].replace('large.jpg', 't500x500.jpg'));
        this.subPosterImage.update(sound['waveform_url'].replace('wis', 'w1').replace('json', 'png'));
        this.update(sound);
      });
    } catch (e) {
      console.log('unable to set poster', e);
    }
  }

  update (sound) {
    this.infosEl_.innerHTML = sound.title;
  }

  src (src) {
    this.widgetPlayer.load(src, this.onReady.bind(this));
  }

  duration () {
    return this.duration_;
  }

  currentTime () {
    return this.currentTime_;
  }

  setCurrentTime (position) {
    this.trigger('seeking');
    this.widgetPlayer.seekTo(position * 1000);
  }

  play () {
    this.widgetPlayer.play();
    this.updatePause();
  }

  pause () {
    this.widgetPlayer.pause();
    this.updatePause();
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
      this.volume_ = percentAsDecimal;
      this.muted_ = !this.volume_;
      this.widgetPlayer.setVolume(this.volume_);
      this.updateVolume();
    }
  }

  setMuted (muted) {
    this.muted_ = muted;
    this.widgetPlayer.setVolume(this.muted_ ? 0 : this.volume_);
    this.updateVolume();
  }
}

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
  return (source.indexOf('soundcloud') !== -1);
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
Soundcloud.nativeSourceHandler.dispose = function () {
};


Soundcloud.Events = 'ready,play,playProgress,loadProgress,pause,seek,finish,error'.split(',');

// Register the native source handler
Soundcloud.registerSourceHandler(Soundcloud.nativeSourceHandler);

Component.registerComponent('Soundcloud', Soundcloud);

Tech.registerTech('Soundcloud', Soundcloud);


export default Soundcloud;
