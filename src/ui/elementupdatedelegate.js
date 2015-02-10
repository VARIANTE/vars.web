/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Delegate for managing update calls of a VARS modeled element.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define(['utils/assert', 'utils/log', 'enums/dirtytype'], function(assert, log, DirtyType) {

/**
 * @constructor
 * Creates a new ElementUpdateDelegate instance.
 */
function ElementUpdateDelegate(element)
{
    if (this.debug) log('[ElementUpdateDelegate]::new(', element, ')');

    var mDirtyTable = 0;

    this.element = element;

    /**
     * @privileged
     * Sets a dirty type as dirty.
     * @param {Number} dirtyType
     */
    this.setDirty = function(dirtyType, validateNow)
    {
        if (this.debug) log('[ElementUpdateDelegate]::setDirty(', dirtyType, validateNow, ')');

        if (this.isDirty(dirtyType) && !validateNow)
        {
            return;
        }

        switch (dirtyType)
        {
            case DirtyType.NONE:
            case DirtyType.ALL:
            {
                mDirtyTable = dirtyType;
                break;
            }

            default:
            {
                mDirtyTable |= dirtyType;
                break;
            }
        }

        if (validateNow)
        {
            this.update();
        }
        else
        {
            _requestAnimationFrame(this.update.bind(this));
        }
    };

    /**
     * @privileged
     * Checks dirty status of a given dirty type.
     * @param  {Number}  dirtyType [description]
     * @return {Boolean}
     */
    this.isDirty = function(dirtyType)
    {
        if (this.debug) log('[ElementUpdateDelegate]::isDirty(', dirtyType, mDirtyTable, ')');

        switch (dirtyType)
        {
            case DirtyType.NONE:
            case DirtyType.ALL:
            {
                return (mDirtyTable == dirtyType);
            }

            default:
            {
                return ((dirtyType & mDirtyTable) !== 0);
            }
        }
    };

    /**
     * @privileged
     * Initializes this ElementUpdateDelegate instance. Must manually invoke.
     */
    this.init = function()
    {
        if (this.debug) log('[ElementUpdateDelegate]::init()');

        if (window)
        {
            window.addEventListener('resize', _onWindowResize.bind(this));
            window.addEventListener('orientationchange', _onWindowResize.bind(this));
            window.addEventListener('scroll', _onWindowScroll.bind(this));
        }

        this.setDirty(DirtyType.ALL);
    };

    /**
     * @privileged
     * Destroys this ElementUpdateDelegate instance.
     */
    this.destroy = function()
    {
        if (this.debug) log('[ElementUpdateDelegate]::destroy()');

        this.onUpdate = null;
    };

    /**
     * @privileged
     * Handler invoked whenever a visual update is required.
     */
    this.update = function(callback)
    {
        if (callback && typeof callback === 'function')
        {
            if (this._updateCallback)
            {
                this._updateCallback = value;
            }
            else
            {
                Object.defineProperty(this, '_updateCallback', { value: callback, writable: true });
            }
        }
        else
        {
            if (this.debug) log('[ElementUpdateDelegate]::update()');

            if (this._updateCallback)
            {
                this._updateCallback.call(null, mDirtyTable);
            }

            // Reset the dirty status of all types.
            this.setDirty(0);
        }
    };

    /**
     * @private
     * Custom requestAnimationFrame implementation.
     * @param  {Function} callback
     */
    var _requestAnimationFrame = (window && window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame) || function(callback)
    {
        if (this.debug) log('[ElementUpdateDelegate]::_requestAnimationFrame(', callback, ')');

        if (window)
        {
            window.setTimeout(callback, 10.0);
        }
    };

    /**
     * @private
     * Handler invoked when the window resizes.
     * @param  {Object} event
     */
    var _onWindowResize = function(event)
    {
        if (this.responsive)
        {
            this.setDirty(DirtyType.SIZE);
        }
    };

    /**
     * @private
     * Handler invoked when the window scrolls.
     * @param  {Object} event
     */
    var _onWindowScroll = function(event)
    {
        if (this.responsive)
        {
            this.setDirty(DirtyType.POSITION);
        }
    };
}

/**
 * @property
 * Indicates whether this ElementUpdateDelegate instance generates debug data.
 * @type {Object}
 */
Object.defineProperty(ElementUpdateDelegate.prototype, 'debug', { value: false, writable: true });

/**
 * @property
 * View of this ElementUpdateDelegate instance.
 * @type {Object}
 */
Object.defineProperty(ElementUpdateDelegate.prototype, 'element', { value: null, writable: true });

/**
 * @property
 * Indicates whether this ElementUpdateDelegate auto responds to window behaviors.
 * @type {Boolean}
 */
Object.defineProperty(ElementUpdateDelegate.prototype, 'responsive', { value: false, writable: true });

return ElementUpdateDelegate; }
);