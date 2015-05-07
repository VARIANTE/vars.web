/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  View model of DOM 'video' element.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define(
[
    'utils/assert',
    'utils/log',
    'utils/inherit',
    'enums/dirtytype',
    'ui/element'
],
function
(
    assert,
    log,
    inherit,
    DirtyType,
    Element
)
{

/**
 * @constructor
 * Creates a new Video instance.
 */
function Video(element)
{
    Element.call(this, element);

    if (this.debug) log('[Video]::new(', element, ')');

    assert(!element || (element instanceof HTMLVideoElement), 'Invalid element type specified. Must be an instance of HTMLVideoElement.');
} var parent = inherit(Video, Element);

/**
 * @static
 * Constants for the 'preload' attribute.
 * @type {Object}
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
 * @type {Boolean}
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
 * @type {Boolean}
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
 * @type {Boolean}
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
 * @type {Boolean}
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
 * @type {String}   URL of image
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
 * @type {String}   See Video.AUTOPLAY
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
 * @type {Array}
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
 * @inheritDoc
 */
Video.prototype.update = function(dirtyTypes)
{
    if (this.debug) log('[Video]::update()');

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
 * @inheritDoc
 */
Video.prototype.factory = function()
{
    return document.createElement('video');
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
