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
        '../enums/dirtytype'
    ],
    function(DirtyType)
    {
        /**
         * @constructor
         * Creates a new ViewController instance.
         */
        function ViewController(view)
        {
            var mDirtyTable = 0;
            var mData;

            /**
             * Name of this ViewController instance.
             * @type {object}
             */
            Object.defineProperty(this, 'name', { value: '', writable: true });

            /**
             * View of this ViewController instance.
             * @type {object}
             */
            Object.defineProperty(this, 'view', { value: view || null, writable: false });

            /**
             * Data providers of this ViewController instance.
             * @type {*}
             */
            Object.defineProperty(this, 'data',
            {
                get: function()
                {
                    return mData;
                }.bind(this),
                set: function(value)
                {
                    mData = value;
                    this.setDirty(DirtyType.DATA);
                }.bind(this)
            });

            /**
             * @privileged
             * Sets a dirty type as dirty.
             * @param {number} dirtyType
             */
            this.setDirty = function(dirtyType, validateNow)
            {
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
                    requestAnimationFrame(this.update.bind(this));
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
                switch (dirtyType)
                {
                    case DirtyType.NONE:
                    case DirtyType.ALL:
                    {
                        return mDirtyTable == dirtyType;
                    }

                    default:
                    {
                        return ((dirtyType & mDirtyTable) !== 0);
                    }
                }
            };
        }

        /**
         * @public
         * Initializes this ViewController instance.
         */
        ViewController.prototype.init = function()
        {
            this.setDirty(DirtyType.ALL);
        };

        /**
         * @public
         * Destroys this ViewController instance.
         */
        ViewController.prototype.destroy = function()
        {

        };

        /**
         * @protected
         * Handler invoked whenever a visual update is required.
         */
        ViewController.prototype.update = function()
        {
            // reset the dirty status of all
            this.setDirty(0);
        };

        /**
         * @protected
         * Gets the string representation of this ViewController instance.
         * @return {string}
         */
        ViewController.prototype.toString = function()
        {
            return '[ViewController{' + this.name + '}]';
        };

        return ViewController;
    }
);