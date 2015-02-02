/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  View controller that complies to dirty redraw flow.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    [
        '../utils',
        '../enums/dirtytype'
    ],
    function(utils, DirtyType)
    {
        /**
         * @constructor
         * Creates a new ViewUpdateDelegate instance.
         */
        function ViewUpdateDelegate(view)
        {
            utils.log('[ViewUpdateDelegate]::new(', view, ')');

            var mDirtyTable = 0;

            /**
             * @privileged
             * Sets a dirty type as dirty.
             * @param {number} dirtyType
             */
            this.setDirty = function(dirtyType, validateNow)
            {
                utils.log('[ViewUpdateDelegate]::setDirty(', dirtyType, validateNow, ')');

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
             * @param  {number}  dirtyType [description]
             * @return {boolean}
             */
            this.isDirty = function(dirtyType)
            {
                utils.log('[ViewUpdateDelegate]::isDirty(', dirtyType, mDirtyTable, ')');

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
             * Initializes this ViewUpdateDelegate instance. Must manually invoke.
             */
            this.init = function()
            {
                utils.log('[ViewUpdateDelegate]::init()');

                this.setDirty(DirtyType.ALL);
            };

            /**
             * @privileged
             * Destroys this ViewUpdateDelegate instance.
             */
            this.destroy = function()
            {
                utils.log('[ViewUpdateDelegate]::destroy()');

                this.onUpdate = null;
            };

            /**
             * @privileged
             * Handler invoked whenever a visual update is required.
             */
            this.update = function()
            {
                utils.log('[ViewUpdateDelegate]::update()');

                if (this.onUpdate)
                {
                    this.onUpdate.call(null, mDirtyTable);
                }

                // Reset the dirty status of all types.
                this.setDirty(0);
            };

            /**
             * @private
             * Custom requestAnimationFrame implementation.
             * @param  {function} callback
             */
            var _requestAnimationFrame = (window && window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame) || function(callback)
            {
                utils.log('[ViewUpdateDelegate]::_requestAnimationFrame(', callback, ')');

                if (window)
                {
                    window.setTimeout(callback, 10.0);
                }
            };

            /**
             * @private
             * Handler invoked when the window resizes.
             * @param  {object} event
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
             * @param  {object} event
             */
            var _onWindowScroll = function(event)
            {
                if (this.responsive)
                {
                    this.setDirty(DirtyType.POSITION);
                }
            };

            if (window)
            {
                window.addEventListener('resize', _onWindowResize.bind(this));
                window.addEventListener('orientationchange', _onWindowResize.bind(this));
                window.addEventListener('scroll', _onWindowScroll.bind(this));
            }
        }

        /**
         * @property
         * Name of this ViewUpdateDelegate instance.
         * @type {object}
         */
        Object.defineProperty(ViewUpdateDelegate.prototype, 'name', { value: '', writable: true });

        /**
         * @property
         * View of this ViewUpdateDelegate instance.
         * @type {object}
         */
        Object.defineProperty(ViewUpdateDelegate.prototype, 'view', { value: null, writable: false });

        /**
         * @property
         * Indicates whether this ViewUpdateDelegate auto responds to window behaviors.
         * @type {bool}
         */
        Object.defineProperty(ViewUpdateDelegate.prototype, 'responsive', { value: false, writable: true });

        /**
         * @property
         * Callback method everytime this ViewUpdateDelegate instance updates.
         * @type {function}
         */
        Object.defineProperty(ViewUpdateDelegate.prototype, 'onUpdate', { value: null, writable: true });

        return ViewUpdateDelegate;
    }
);