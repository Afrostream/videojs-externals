/**
 * @file spotify.js
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
 * @class Spotify
 */

class Spotify extends Externals {
  constructor (options, ready) {
    super(options, ready);
  }

  createEl () {
    let source = null;
    if ('string' === typeof this.options_.source) {
      source = this.options_.source;
    }
    else if ('object' === typeof this.options_.source) {
      source = this.options_.source.src;
    }

    const el_ = super.createEl('iframe', {
      width: '100%',
      height: '100%',
      onload: () => this.onStateChange({type: 'apiready'}),
      src: `https://embed.spotify.com/?uri=${source}`
    }, false);

    el_.firstChild.style.visibility = this.options_.visibility;

    const tagPlayer = videojs(this.options_.playerId);
    tagPlayer.controls(false);

    return el_;
  }

  addScriptTag () {
    this.initTech();
  }

  isApiReady () {
    return true;
  }


  parseSrc (src) {
    return src;
  }

  setupTriggers () {
    //SPOTIFY don't have embed api
  }

  ended () {
    return false;
  }

  play () {
  }

  pause () {
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

  src (src) {
    if (typeof src !== 'undefined') {
      this.el_.src(src);
    }
  }

}

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
  return (source.indexOf('spotify') !== -1);
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
Spotify.nativeSourceHandler.dispose = function () {
};


Spotify.Events = ''.split(',');

// Register the native source handler
Spotify.registerSourceHandler(Spotify.nativeSourceHandler);

Component.registerComponent('Spotify', Spotify);

Tech.registerTech('Spotify', Spotify);


export default Spotify;
