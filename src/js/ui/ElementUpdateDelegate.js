/**
 *  vars
 *  (c) VARIANTE (http://variante.io)
 *
 *  Delegate for managing update calls of a VARS modeled element.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    [
        'utils/assert',
        'utils/debounce',
        'utils/log',
        'enums/DirtyType'
    ],
    function
    (
        assert,
        debounce,
        log,
        DirtyType
    )
    {
        /**
         * @static
         *
         * Default refresh (debounce) rate in milliseconds.
         *
         * @type {Number}
         */
        var DEFAULT_REFRESH_RATE = 0.0;

        /**
         * @constructor
         *
         * Creates a new ElementUpdateDelegate instance.
         */
        function ElementUpdateDelegate(delegate)
        {
            if (this.debug) log('[ElementUpdateDelegate]::new(', delegate, ')');

            var mDirtyTable = 0;
            var mResizeHandler = null;
            var mScrollHandler = null;

            this.delegate = delegate;

            /**
             * @privileged
             *
             * Sets a dirty type as dirty.
             *
             * @param {Number} dirtyType
             */
            this.setDirty = function(dirtyType, validateNow)
            {
                if (this.debug) log('[ElementUpdateDelegate]::setDirty(', dirtyType, validateNow, ')');

                if (this.transmissive !== DirtyType.NONE)
                {
                    if (this.delegate.virtualChildren)
                    {
                        for (var name in this.delegate.virtualChildren)
                        {
                            var child = this.delegate.virtualChildren[name];

                            if (child.updateDelegate && child.updateDelegate.setDirty)
                            {
                                var transmitted = dirtyType & child.updateDelegate.receptive;

                                if (transmitted !== DirtyType.NONE)
                                {
                                    child.updateDelegate.setDirty(transmitted, validateNow);
                                }
                            }
                        }
                    }
                }

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
                else if (!this._pendingAnimationFrame)
                {
                    this._pendingAnimationFrame = _requestAnimationFrame(this.update.bind(this));
                }
            };

            /**
             * @privileged
             *
             * Checks dirty status of a given dirty type.
             *
             * @param  {Number}  dirtyType [description]
             *
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
             *
             * Initializes this ElementUpdateDelegate instance. Must manually invoke.
             */
            this.init = function()
            {
                if (this.debug) log('[ElementUpdateDelegate]::init()');

                var r = this.conductor || window;

                if (window && r && r.addEventListener && this.responsive)
                {
                    if (this.refreshRate === 0.0)
                    {
                        mResizeHandler = _onWindowResize.bind(this);
                        mScrollHandler = _onWindowScroll.bind(this);
                    }
                    else
                    {
                        mResizeHandler = debounce(_onWindowResize.bind(this), this.refreshRate);
                        mScrollHandler = debounce(_onWindowScroll.bind(this), this.refreshRate);
                    }

                    window.addEventListener('resize', mResizeHandler);
                    window.addEventListener('orientationchange', mResizeHandler);
                    r.addEventListener('scroll', mScrollHandler);
                }

                this.setDirty(DirtyType.ALL);
            };

            /**
             * @privileged
             *
             * Destroys this ElementUpdateDelegate instance.
             */
            this.destroy = function()
            {
                if (this.debug) log('[ElementUpdateDelegate]::destroy()');

                _cancelAnimationFrame();

                var r = this.conductor || window;

                if (window && r && r.removeEventListener && this.responsive)
                {
                    window.removeEventListener('resize', mResizeHandler);
                    window.removeEventListener('orientationchange', mResizeHandler);
                    r.removeEventListener('scroll', mScrollHandler);
                }

                mResizeHandler = null;
                mScrollHandler = null;
            };

            /**
             * @privileged
             *
             * Handler invoked whenever a visual update is required.
             */
            this.update = function()
            {
                if (this.debug) log('[ElementUpdateDelegate]::update()');

                _cancelAnimationFrame(this._pendingAnimationFrame);

                if (this.delegate && this.delegate.update)
                {
                    this.delegate.update.call(this.delegate, mDirtyTable);
                }

                // Reset the dirty status of all types.
                this.setDirty(0);

                this._pendingAnimationFrame = null;
            };

            /**
             * @private
             *
             * Custom requestAnimationFrame implementation.
             *
             * @param  {Function} callback
             */
            var _requestAnimationFrame = function(callback)
            {
                var raf = window && (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame) || null;

                if (!raf)
                {
                    raf = function(callback)
                    {
                        if (window)
                        {
                            return window.setTimeout(callback, 10.0);
                        }
                        else
                        {
                            return null;
                        }
                    };
                }

                return raf(callback);
            };

            /**
             * @private
             *
             * Custom cancelAnimationFrame implementation.
             *
             * @return {Function} callback
             */
            var _cancelAnimationFrame = function(callback)
            {
                var caf = window && (window.requestAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame) || null;

                if (!caf)
                {
                    caf = function(callback)
                    {
                        if (window)
                        {
                            return window.clearTimeout(callback);
                        }
                        else
                        {
                            return null;
                        }
                    };
                }

                return caf;
            };

            /**
             * @private
             *
             * Handler invoked when the window resizes.
             *
             * @param  {Object} event
             */
            var _onWindowResize = function(event)
            {
                this.setDirty(DirtyType.SIZE);
            };

            /**
             * @private
             *
             * Handler invoked when the window scrolls.
             *
             * @param  {Object} event
             */
            var _onWindowScroll = function(event)
            {
                this.setDirty(DirtyType.POSITION);
            };
        }

        /**
         * @property
         *
         * Indicates whether this ElementUpdateDelegate instance generates debug data.
         *
         * @type {Object}
         */
        Object.defineProperty(ElementUpdateDelegate.prototype, 'debug', { value: false, writable: true });

        /**
         * @property
         *
         * Delegate of this ElementUpdateDelegate instance.
         *
         * @type {Object}
         */
        Object.defineProperty(ElementUpdateDelegate.prototype, 'delegate', { value: null, writable: true });

        /**
         * @property
         *
         * Indicates whether this ElementUpdateDelegate auto responds to window behaviors.
         *
         * @type {Boolean}
         */
        Object.defineProperty(ElementUpdateDelegate.prototype, 'responsive', { value: false, writable: true });

        /**
         * @property
         *
         * Indicates the debounce rate of this ElementUpdateDelegate instance.
         *
         * @type {Number}
         */
        Object.defineProperty(ElementUpdateDelegate.prototype, 'refreshRate', { value: DEFAULT_REFRESH_RATE, writable: true });

        /**
         * @property
         *
         * Indicates the dirty flags in which ElementUpdateDelgate instance will transmit to its child instances.
         *
         * @type {Number}
         */
        Object.defineProperty(ElementUpdateDelegate.prototype, 'transmissive', { value: DirtyType.NONE, writable: true });

        /**
         * @property
         *
         * Indicates the dirty flags in which this ElementUpdateDelegate is capable of receiving.
         *
         * @type {Number}
         */
        Object.defineProperty(ElementUpdateDelegate.prototype, 'receptive', { value: DirtyType.NONE, writable: true });

        /**
         * @property
         *
         * Indicates the conductor in which this ElementUpdateDelegate responds to (defaults to window).
         *
         * @type {Object}
         */
        Object.defineProperty(ElementUpdateDelegate.prototype, 'conductor', { value: window, writable: true });

        /**
         * @protected
         *
         * Gets the string representation of this ElementUpdateDelegate instance.
         *
         * @return {String}
         */
        ElementUpdateDelegate.prototype.toString = function()
        {
            return '[ElementUpdateDelegate{' + ((this.delegate && this.delegate.name) || 'undefined') + '}]';
        };

        return ElementUpdateDelegate;
    }
);