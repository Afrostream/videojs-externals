/**
 * @file Dailymotion.js
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
 * @class Dailymotion
 */

class Dailymotion extends Externals {
    constructor (options, ready) {
        super(options, ready);
    }

    createEl () {

        let dailymotionSource = null;
        if ('string' === typeof this.options_.source) {
            dailymotionSource = this.options_.source;
        }
        else if ('object' === typeof this.options_.source) {
            dailymotionSource = this.options_.source.src;
        }

        dailymotionSource = this.parseSrc(dailymotionSource);

        const el_ = super.createEl('iframe', {
            id: this.options_.techId,
            src: `about:blank`,
        });
        el_.className += ' vjs-dailymotion-loading';

        videojs(this.options_.playerId);
        return el_;
    }


    parseSrc (src) {
        if (src) {
            // Regex that parse the video ID for any Dailymotion URL
            var regExp = /^.+dailymotion.com\/((video|hub)\/([^_]+))?[^#]*(#video=([^_&]+))?/;
            var match = src.match(regExp);

            return match ? match[5] || match[3] : null;
        }
    }

    isApiReady () {
        return window['DM'] && window['DM']['player'];
    }
    
    injectCss (overrideStyle) {
        if(!overrideStyle) {
            overrideStyle = '';
        }
        overrideStyle += '.vjs-dailymotion.vjs-dailymotion-loading {padding-top: 52.6%;background: transparent;}';
        super.injectCss(overrideStyle);
    }

    initTech () {
        if (!this.isApiReady()) {
            return;
        }
        let source = null;
        if ('string' === typeof this.options_.source) {
            source = this.options_.source;
        } else if ('object' === typeof this.options_.source) {
            source = this.options_.source.src;
        }

        let videoId = this.parseSrc(source);

        const dmOpts = videojs.mergeOptions(this.options_, {
            video: videoId,
            width: this.options_.width,
            height: this.options_.height,
            params: videojs.mergeOptions(this.player_.options_, {
                controls: false, // disable DM controls & buttons for better integration
                'endscreen-enable': false, 
                'sharing-enable': false
            })
        });

        this.widgetPlayer = new window.DM.player(this.options_.techId, dmOpts);
        this.widgetPlayer.addEventListener('apiready', videojs.bind(this, this.onReady));
        super.initTech();
        this.onStateChange({type: -1});
    }

    onReady () {
        super.onReady();
        this.updateDuration();
        this.updateVolume();
        this.updatePoster();
        this.onStateChange({type: 'ready'});
        this.el_.className.replace(' vjs-dailymotion-loading', ''); // remove loading class
    }

    updatePoster () {
        /*jshint camelcase: false */
        try {
            //const track = this.widgetPlayer.getCurrentTrack();
            let videoId = null;
            if ('string' === typeof this.options_.source) {
                videoId = this.options_.source;
            } else if ('object' === typeof this.options_.source) {
                videoId = this.options_.source.src;
            }
            videoId = this.parseSrc(videoId);
            var apiUrl = 'https://api.dailymotion.com/video/'+ videoId +'?fields=thumbnail_large_url';
            videojs.xhr(apiUrl, {responseType: 'json'}, function(err, data) {
                if(data.body.thumbnail_large_url) {
                    this.setPoster(data.body.thumbnail_large_url);
                }
            }.bind(this));

        } catch (e) {
            console.log('unable to set poster', e);
        }
    }

    setupTriggers () {
        this.widgetPlayer.vjsTech = this;
        for (var i = Dailymotion.Events.length - 1; i >= 0; i--) {
            const eventName = Dailymotion.Events[i];
            /*jshint loopfunc: true */
            this.widgetPlayer.addEventListener(eventName, (data) => {
                this.eventHandler(videojs.mergeOptions({type: eventName}, data));
            });
        }
    }

    onStateChange (event) {
        let state = event.type;
        this.lastState = state;
        super.onStateChange(event);
        switch (state) {
            case -1:
                if(this.options_.autoplay) {
                    this.trigger('loadstart');
                    this.trigger('waiting');
                }
                break;
            case 'video_end':
                this.updateEnded();
                this.updatePaused();
                this.trigger('ended');
                break;
            case 'start':
                this.trigger('loadedmetadata');
                this.trigger('durationchange');
                this.trigger('canplay');
                this.updatePaused();
                break;
            case 'durationchange':
                this.updateDuration();
                break;
            case 'volumechange':
                this.updateVolume();
                break;
            case 'timeupdate':
                this.currentTime_ = this.widgetPlayer.currentTime;
                break;
            case 'progress':
                this.buffered_ = this.widgetPlayer.bufferedTime;
                break;
            case 'pause':
                this.updatePaused();
                this.trigger('pause');
                break;
            case 'play':
                this.updatePaused();
                this.trigger('play');
                break;
            case 'ready':
                this.trigger('loadedmetadata');
                this.trigger('canplay');
                break;
        }
    }

    updateVolume () {
        let vol = this.widgetPlayer.volume;
        if(typeof this.volumeBefore_ === 'undefined') {
            this.volumeBefore_ = vol;
        }
        if(this.volume_ !== vol) {
            this.volume_ = vol;
            this.trigger('volumechange');
        }
    }

    updateEnded () {
        this.ended_ = this.widgetPlayer.ended;
    }

    updatePaused () {
        this.paused_ = this.widgetPlayer.paused;
    }

    updateDuration () {
        this.duration_ = this.widgetPlayer.duration;
    }

    buffered () {
        return videojs.createTimeRange(0, this.buffered_ || 0);
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
        this.widgetPlayer.seek(seconds);
        this.currentTime_ = seconds;
    }

    play () {
        this.widgetPlayer.play();
    }

    pause () {
        this.widgetPlayer.pause();
    }

    seek (time) {
        this.widgetPlayer.seek(time);
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
            this.widgetPlayer.setVolume(percentAsDecimal);
            this.updateVolume();
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

Dailymotion.prototype.options_ = {
    api: '//api.dmcdn.net/all.js',
    embed: '//www.dailymotion.com/embed/video/',
    visibility: 'visible'
};

Dailymotion.prototype.className_ = 'dailymotion';

/* Dailymotion Support Testing -------------------------------------------------------- */

Dailymotion.isSupported = function () {
    return true;
};

// Add Source Handler pattern functions to this tech
Tech.withSourceHandlers(Dailymotion);

/*
 * The default native source handler.
 * This simply passes the source to the video element. Nothing fancy.
 *
 * @param  {Object} source   The source object
 * @param  {Flash} tech  The instance of the Flash tech
 */
Dailymotion.nativeSourceHandler = {};

/**
 * Check if Flash can play the given videotype
 * @param  {String} type    The mimetype to check
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Dailymotion.nativeSourceHandler.canPlayType = function (source) {
    return (source.indexOf('dailymotion') !== -1);
};

/*
 * Check Dailymotion can handle the source natively
 *
 * @param  {Object} source  The source object
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
Dailymotion.nativeSourceHandler.canHandleSource = function (source) {

    // If a type was provided we should rely on that
    if (source.type) {
        return Dailymotion.nativeSourceHandler.canPlayType(source.type);
    } else if (source.src) {
        return Dailymotion.nativeSourceHandler.canPlayType(source.src);
    }

    return '';
};

Dailymotion.nativeSourceHandler.handleSource = function (source, tech) {
    tech.src(source.src);
};

/*
 * Clean up the source handler when disposing the player or switching sources..
 * (no cleanup is needed when supporting the format natively)
 */
Dailymotion.nativeSourceHandler.dispose = function () {
};

// Register the native source handler
Dailymotion.registerSourceHandler(Dailymotion.nativeSourceHandler);

Dailymotion.Events = ('loaded,play,playing,pause,loadedmetadata,durationchange,ended,'+
    'timeupdate,progress,seeking,seeked,subtitlechange,'+
    'volumechange,error,video_start,video_end,waiting').split(',');

Component.registerComponent('Dailymotion', Dailymotion);

Tech.registerTech('Dailymotion', Dailymotion);


export default Dailymotion;
