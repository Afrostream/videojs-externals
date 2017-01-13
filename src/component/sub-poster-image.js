/**
 * @file sub-poster-image.js
 */
import videojs from 'video.js';
const Component = videojs.getComponent('Component');
const PosterImage = videojs.getComponent('PosterImage');

/**
 * The component that handles showing the poster image.
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends Button
 * @class SubPosterImage
 */
class SubPosterImage extends PosterImage {

  constructor (player, options) {
    super(player, options);
  }

  /**
   * Event handler for updates to the player's poster source
   *
   * @method update
   */
  update (url) {

    this.setSrc(url);

    // If there's no poster source we should display:none on this component
    // so it's not still clickable or right-clickable
    if (url) {
      this.show();
    } else {
      this.hide();
    }
  }

}

Component.registerComponent('SubPosterImage', SubPosterImage);
export default SubPosterImage;
