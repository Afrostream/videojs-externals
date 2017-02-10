/**
 * @file Deezer.js
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
 * @class Deezer
 */

class Deezer extends Externals {
  constructor (options, ready) {
    super(options, ready);
  }

  injectCss () {
    let css = `.vjs-${this.className_} > .vjs-poster { display:block; width:50%; background-size:contain; background-position: 0 50%; background-color: #000; }
    .vjs-${this.className_} .vjs-tech > .vjs-poster {  display:block; background-color: rgba(76, 50, 65, 0.35);}
    .vjs-deezer-info{position:absolute;padding:3em 1em 1em 1em;left:50%;top:0;right:0;bottom:0;
      text-align: center; pointer-events: none; text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.69);}`;
    super.injectCss(css);
  }

  createEl () {

    let source = null;
    if ('string' === typeof this.options_.source) {
      source = this.options_.source;
    }
    else if ('object' === typeof this.options_.source) {
      source = this.options_.source.src;
    }

    source = this.parseSrc(source);

    const el_ = super.createEl('div', {
      width: '100%',
      height: '100%',
      src: `//www.deezer.com/plugins/player?type=tracks&id=${source}
      &format=classic&color=007FEB&autoplay=${this.options_.autoplay}
      &playlist=${this.options_.playList}&width=100%&height=100%`
    });

    this.infosEl_ = videojs.createEl('div', {
      className: 'vjs-deezer-info'
    });

    const deezerEl = videojs.createEl('div', {
      id: 'dz-root'
    });

    el_.firstChild.style.visibility = this.options_.visibility;
    el_.appendChild(this.infosEl_);
    el_.appendChild(deezerEl);

    return el_;
  }

  isApiReady () {
    return window['DZ'] && window['DZ']['player'];
  }

  onStateChange (event) {
    let state = event.type;
    switch (state) {
      case -1:
        this.trigger('loadstart');
        this.trigger('waiting');
        break;

      case 'player_loaded':
        this.trigger('loadedmetadata');
        this.trigger('durationchange');
        this.trigger('canplay');
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

  parseSrc (src) {
    if (src) {
      // Regex that parse the video ID for any Dailymotion URL
      var regExp = /^https?:\/\/(?:www\.)?deezer\.com\/(track|album|playlist)\/(\d+)$/;
      var match = src.match(regExp);

      return match ? match[2] || match[2] : null;
    }
  }

  onReady () {
    super.onReady();
    this.updateDuration();
    this.updateVolume();
    this.updatePoster();
  }

  initTech () {
    DZ.init({
      channelUrl: `${window.location.protocol}//${window.location.hostname}`,
      appId: this.options_.appId,
      player: {
        container: this.options_.techId,
        width: 800,
        height: 300,
        onload: this.onReady.bind(this)
      }
    });
    this.widgetPlayer = DZ.player;
    super.initTech();
  }

  setupTriggers () {
    this.widgetPlayer.vjsTech = this;
    for (var i = Deezer.Events.length - 1; i >= 0; i--) {
      const eventName = Deezer.Events[i];
      /*jshint loopfunc: true */
      DZ.Event.subscribe(eventName, (data, event) => {
        this.eventHandler(videojs.mergeOptions({type: event || data}, data));
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
  }

  /**
   * Request to exit fullscreen
   *
   * @method exitFullScreen
   */
  exitFullScreen () {
  }

  updatePause () {
    this.paused_ = !this.widgetPlayer.isPlaying();
  }

  updateDuration () {
    const track = this.widgetPlayer.getCurrentTrack();
    this.duration_ = track && track.duration || 0;
    this.trigger('durationchange');
  }

  updateVolume () {
    this.volume_ = this.widgetPlayer.getVolume();
    this.trigger('volumechange');
  }

  updatePoster () {
    try {
      //const track = this.widgetPlayer.getCurrentTrack();
      let track = {};
      if ('string' === typeof this.options_.source) {
        track.id = this.options_.source;
      }
      else if ('object' === typeof this.options_.source) {
        track.id = this.options_.source.src;
      }

      track.id = this.parseSrc(track.id);

      DZ.api('/track/' + track.id, (response) => {
        this.setPoster(`${response.album['cover_big']}`);
        this.update(response);
      });
    } catch (e) {
      console.log('unable to set poster', e);
    }
  }

  update (sound) {
    this.infosEl_.innerHTML = sound.title;
  }

  src (source) {


    if (!source || !source.src) {
      if ('string' === typeof this.options_.source) {
        source = this.options_.source;
      }
      else if ('object' === typeof this.options_.source) {
        source = this.options_.source.src;
      }

      source = this.parseSrc(source);
    }

    this.widgetPlayer.playTracks([source]);
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
    this.widgetPlayer.setMute(this.muted_);
    this.updateVolume();
  }
}

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
  return (source.indexOf('deezer') !== -1);
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
Deezer.nativeSourceHandler.dispose = function () {
};


Deezer.Events = 'player_loaded,player_play,player_paused,player_position,player_buffering,volume_changed,shuffle_changed,mute_changed,track_end,'.split(',');

// Register the native source handler
Deezer.registerSourceHandler(Deezer.nativeSourceHandler);

Component.registerComponent('Deezer', Deezer);

Tech.registerTech('Deezer', Deezer);


export default Deezer;
