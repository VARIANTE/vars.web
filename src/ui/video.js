/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  View model of DOM 'video' element.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define(['../utils', '../enums/dirtytype', '../ui/element'], function(utils, DirtyType, Element) {

/**
 * @constructor
 * Creates a new Video instance.
 */
function Video(element)
{
    vars.ui.Element.call(this, element);

    if (this.debug) utils.log('[Video]::new(', element, ')');

    utils.assert(!element || (element instanceof HTMLVideoElement), 'Invalid element type specified. Must be an instance of HTMLVideoElement.');
}

var parent = utils.inherit(Video, Element);

/**
 * @static
 * Constants for the 'preload' attribute.
 * @type {object}
 * @see  http://www.w3schools.com/tags/tag_video.asp
 */
Video.PRELOAD =
{
    AUTO:     'auto',
    METADATA: 'metada',
    NONE:     'none'
};

/**
 * @property
 * Specifies that the video will start playing as soon as it is ready.
 * @type {boolean}
 */
Object.defineProperty(Video.prototype, 'autoplay',
{
    get: function()
    {
        return this.element.autoplay;
    },
    set: function(value)
    {
        this.element.autoplay = value;
        this.updateDelegate.setDirty(DirtyType.CUSTOM);
    }
});

/**
 * @property
 * Specifies that video controls should be displayed (such as a play/pause button etc).
 * @type {boolean}
 */
Object.defineProperty(Video.prototype, 'controls',
{
    get: function()
    {
        return this.element.controls;
    },
    set: function(value)
    {
        this.element.controls = value;
        this.updateDelegate.setDirty(DirtyType.CUSTOM);
    }
});

/**
 * @property
 * Specifies that the video will start over again, every time it is finished.
 * @type {boolean}
 */
Object.defineProperty(Video.prototype, 'loop',
{
    get: function()
    {
        return this.element.loop;
    },
    set: function(value)
    {
        this.element.loop = value;
        this.updateDelegate.setDirty(DirtyType.CUSTOM);
    }
});

/**
 * @property
 * Specifies that the audio output of the video should be muted.
 * @type {boolean}
 */
Object.defineProperty(Video.prototype, 'muted',
{
    get: function()
    {
        return this.element.muted;
    },
    set: function(value)
    {
        this.element.muted = value;
        this.updateDelegate.setDirty(DirtyType.CUSTOM);
    }
});

/**
 * @property
 * Specifies an image to be shown while the video is downloading, or until the user hits the play button.
 * @type {string}   URL of image
 */
Object.defineProperty(Video.prototype, 'poster',
{
    get: function()
    {
        return this.element.poster;
    },
    set: function(value)
    {
        this.element.poster = value;
        this.updateDelegate.setDirty(DirtyType.CUSTOM);
    }
});

/**
 * @property
 * Specifies if and how the author thinks the video should be loaded when the page loads
 * @type {string}   See Video.AUTOPLAY
 */
Object.defineProperty(Video.prototype, 'preload',
{
    get: function()
    {
        return this.element.preload;
    },
    set: function(value)
    {
        this.element.preload = value;
        this.updateDelegate.setDirty(DirtyType.CUSTOM);
    }
});

/**
 * @property
 * Array of sources containing elements in the form of:
 *     Object
 *     {
 *         src: {PATH_OF_SOURCE} (String)
 *         type: {TYPE_OF_SOURCE} (String)
 *     }
 * @type {array}
 */
Object.defineProperty(Video.prototype, 'source',
{
    get: function()
    {
        return this._source;
    },
    set: function(value)
    {
        Object.defineProperty(this, '_source', { value: value, writable: true });
        this.updateDelegate.setDirty(DirtyType.DATA);
    }
});

/**
 * @public
 * Initializes this Video instance. Must manually invoke.
 */
Video.prototype.init = function()
{
    if (this.debug) utils.log('[Video]::init()');

    if (!this.element)
    {
        this.element = document.createElement('video');
    }

    parent.prototype.init.call(this);
};

/**
 * @public
 * Destroys this Video instance.
 */
Video.prototype.destroy = function()
{
    if (this.debug) utils.log('[Video]::destroy()');

    parent.prototype.destroy.call(this);
};

/**
 * @public
 * Handler invoked whenever a visual update is required.
 */
Video.prototype.update = function(dirtyTypes)
{
    if (this.debug) utils.log('[Video]::update()');

    if (this.isDirty(DirtyType.DATA))
    {
        this._updateSource();
    }

    if (this.isDirty(DirtyType.CUSTOM))
    {

    }

    parent.prototype.update.call(this, dirtyTypes);
};

/**
 * @private
 * Updates the sources in this Video instance.
 */
Video.prototype._updateSource = function()
{
    var i;
    var arrlen;

    // Update source(s).
    var oldSources = this.element.getElementsByTagName('source');

    arrlen = oldSources.length;

    for (i = 0; i < arrlen; i++)
    {
        var oldSource = oldSources[i];

        this.element.removeChild(oldSource);
    }

    if (!this.source) return;

    arrlen = this.source.length;

    for (i = 0; i < arrlen; i++)
    {
        var newSource = document.createElement('source');
        var path = this.source[i].src;
        var type = this.source[i].type;
        var ext = path.split('.').pop();

        newSource.setAttribute('src', path);
        newSource.setAttribute('type', type || 'video/'+ext);

        this.element.appendChild(newSource);
    }
};

return Video; });
