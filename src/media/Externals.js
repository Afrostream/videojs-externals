/**
 * @file videojs-externals.js
 * Externals (iframe) Media Controller - Wrapper for HTML5 Media API
 */
import videojs from 'video.js';

const Component = videojs.getComponent('Component');
const Tech = videojs.getComponent('Tech');

/**
 * Externals Media Controller - Wrapper for HTML5 Media API
 *
 * @param {Object=} options Object of option names and values
 * @param {Function=} ready Ready callback function
 * @extends Tech
 * @class Externals
 */

class Externals extends Tech {
  constructor (options, ready) {
    super(options, ready);
    this.params = {
      id: this.options_.techId,
      autoplay: parseInt(options.autoplay),
      chromeless: parseInt(options.controls),
      html: 1,
      info: 1,
      logo: 1,
      controls: 'html',
      wmode: 'opaque',
      format: 'json',
      url: options.source.src
    };

    // If we are not on a server, don't specify the origin (it will crash)
    if (window.location.protocol !== 'file:') {
      this.params.origin = window.location.protocol + '//' + window.location.hostname;
    }

    this.videoId = this.parseSrc(options.source.src);
    //if (Externals.isApiReady) {
    this.loadApi();

    //} else {
    //   Add to the queue because the Externals API is not ready
    //Externals.apiReadyQueue.push(this);
    //}
  }

  parseSrc (src) {
    return src;
  }

  createEl (options) {

    let el = videojs.createEl('div', {
      id: 'vjs-tech' + this.options_.techId,
      className: 'vjs-tech vjs-tech-' + this.className_,
    });

    let iframeContainer = videojs.createEl('iframe', videojs.mergeOptions({
      id: this.options_.techId,
      scrolling: 'no',
      marginWidth: 0,
      marginHeight: 0,
      frameBorder: 0,
      webkitAllowFullScreen: '',
      mozallowfullscreen: '',
      allowFullScreen: '',
    }, options));

    el.appendChild(iframeContainer);

    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent) || !/(iPad|iPhone|iPod|Android)/g.test(navigator.userAgent)) {
      let divBlocker = videojs.createEl('div',
        {
          className: 'vjs-iframe-blocker',
          style: 'position:absolute;top:0;left:0;width:100%;height:100%'
        });

      // In case the blocker is still there and we want to pause
      divBlocker.onclick = function () {
        this.pause();
      }.bind(this);

      el.appendChild(divBlocker);
    }

    return el;
  }

  addScriptTag () {
    var r = false,
      self = this,
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
        self.setupTriggers();
      }
    };

    js.src = this.options_.api;
    s.insertBefore(js, s.firstChild);
  }

  loadApi () {
    this.addScriptTag();
  }

  setupTriggers () {
    this.widgetPlayer.vjsTech = this;
    this.widgetPlayer.listeners = [];
    for (var i = Externals.Events.length - 1; i >= 0; i--) {
      var listener = videojs.bind(this, this.eventHandler);
      this.widgetPlayer.listeners.push({event: Externals.Events[i], func: listener});
      this.widgetPlayer.addEventListener(Externals.Events[i], listener);
    }
  }

  eventHandler (e) {
    if (!e) {
      return;
    }
    this.onStateChange(e);
    this.trigger(e);
  }

  onStateChange (event) {
    let state = event.type;
    if (state !== this.lastState) {
      this.lastState = state;
    }
  }

  onReady () {
    this.triggerReady();
  }

  poster () {
    return this.poster_;
  }

  setPoster (poster) {
    this.poster_ = poster;
    this.trigger('posterchange');
  }

  /**
   * Set video
   *
   * @param {Object=} src Source object
   * @method setSrc
   */
  src (src) {
    if (typeof src !== 'undefined') {
      this.src_ = this.parseSrc(src);
    }
    return this.src_;
  }

  currentSrc () {
    return this.src_;
  }

  play () {
  }

  ended () {
    if (this.isReady_) {
      return this.lastState === 0;
    } else {
      // We will play it when the API will be ready
      return false;
    }
  }

  pause () {
  }

  paused () {
    return false;
  }

  currentTime () {
    return 0;
  }

  setCurrentTime (position) {
    this.currentTime = position;
  }

  duration () {
    return 0;
  }

  volume () {
    return this.volume_;
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


  setVolume (percentAsDecimal) {
    if (typeof(percentAsDecimal) !== 'undefined' && percentAsDecimal !== this.volume_) {
      this.volume_ = percentAsDecimal;
      this.trigger('volumechange');
    }
  }

  buffered () {
    return [];
  }

  controls () {
    return false;
  }

  muted () {
    return this.muted_;
  }

  setMuted (muted) {
    this.muted_ = muted;
  }

  supportsFullScreen () {
    return true;
  }


  resetSrc_ (callback) {
    callback();
  }

  dispose () {
    this.resetSrc_(Function.prototype);
    super.dispose(this);
  }

  onPlayerError (e) {
    this.errorNumber = e.data;
    this.trigger('error');
  }

  error () {
    return {code: 'External unknown error (' + this.errorNumber + ')'};
  }
}


Externals.prototype.className_ = ' vjs-externals';

Externals.prototype.options_ = {
  visibility: 'hidden'
};

Externals.apiReadyQueue = [];


/* Externals Support Testing -------------------------------------------------------- */

Externals.isSupported = function () {
  return true;
};

// Add Source Handler pattern functions to this tech
Tech.withSourceHandlers(Externals);

/*
 * The default native source handler.
 * This simply passes the source to the video element. Nothing fancy.
 *
 * @param  {Object} source   The source object
 * @param  {Flash} tech  The instance of the Flash tech
 */
Externals.nativeSourceHandler = {};

/**
 * Check if Flash can play the given videotype
 * @param  {String} type    The mimetype to check
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Externals.nativeSourceHandler.canPlayType = function (source) {

  const dashExtRE = /^video\/(externals)/i;

  if (dashExtRE.test(source)) {
    return 'maybe';
  } else {
    return '';
  }

};

/*
 * Check Flash can handle the source natively
 *
 * @param  {Object} source  The source object
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Externals.nativeSourceHandler.canHandleSource = function (source) {

  // If a type was provided we should rely on that
  if (source.type) {
    return Externals.nativeSourceHandler.canPlayType(source.type);
  } else if (source.src) {
    return Externals.nativeSourceHandler.canPlayType(source.src);
  }

  return '';
};

/*
 * Pass the source to the flash object
 * Adaptive source handlers will have more complicated workflows before passing
 * video data to the video element
 *
 * @param  {Object} source    The source object
 * @param  {Flash} tech   The instance of the Flash tech
 */
Externals.nativeSourceHandler.handleSource = function (source, tech) {
  tech.src(source.src);
};

/*
 * Clean up the source handler when disposing the player or switching sources..
 * (no cleanup is needed when supporting the format natively)
 */
Externals.nativeSourceHandler.dispose = function () {
};

// Register the native source handler
Externals.registerSourceHandler(Externals.nativeSourceHandler);

/*
 * Set the tech's volume control support status
 *
 * @type {Boolean}
 */
Externals.prototype['featuresVolumeControl'] = true;

/*
 * Set the tech's playbackRate support status
 *
 * @type {Boolean}
 */
Externals.prototype['featuresPlaybackRate'] = false;

/*
 * Set the tech's status on moving the video element.
 * In iOS, if you move a video element in the DOM, it breaks video playback.
 *
 * @type {Boolean}
 */
Externals.prototype['movingMediaElementInDOM'] = false;

/*
 * Set the the tech's fullscreen resize support status.
 * HTML video is able to automatically resize when going to fullscreen.
 * (No longer appears to be used. Can probably be removed.)
 */
Externals.prototype['featuresFullscreenResize'] = false;

/*
 * Set the tech's timeupdate event support status
 * (this disables the manual timeupdate events of the Tech)
 */
Externals.prototype['featuresTimeupdateEvents'] = false;

/*
 * Set the tech's progress event support status
 * (this disables the manual progress events of the Tech)
 */
Externals.prototype['featuresProgressEvents'] = false;

/*
 * Sets the tech's status on native text track support
 *
 * @type {Boolean}
 */
Externals.prototype['featuresNativeTextTracks'] = true;

/*
 * Sets the tech's status on native audio track support
 *
 * @type {Boolean}
 */
Externals.prototype['featuresNativeAudioTracks'] = true;

/*
 * Sets the tech's status on native video track support
 *
 * @type {Boolean}
 */
Externals.prototype['featuresNativeVideoTracks'] = false;

Externals.Events = 'apiready,ad_play,ad_start,ad_timeupdate,ad_pause,ad_end,video_start,' +
  'video_end,play,playing,pause,ended,canplay,canplaythrough,timeupdate,progress,seeking,' +
  'seeked,volumechange,durationchange,fullscreenchange,error'.split(',');

Component.registerComponent('Externals', Externals);

Tech.registerTech('Externals', Externals);


export default Externals;
