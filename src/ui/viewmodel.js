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
        '../enums/dirtytype',
        '../ui/viewupdatedelegate'
    ],
    function(utils, DirtyType, ViewUpdateDelegate)
    {
        /**
         * @constructor
         * Creates a new ViewModel instance.
         */
        function ViewModel(view)
        {
            utils.log('[ViewModel]::new(', view, ')');

            this.view = view;

            this.init();
        }

        /**
         * @property
         * View of this ViewModel instance.
         * @type {object}
         */
        Object.defineProperty(ViewModel.prototype, 'view', { value: null, writable: true });

        /**
         * @property
         * Name of this ViewModel instance.
         * @type {object}
         */
        Object.defineProperty(ViewModel.prototype, 'name', { value: '', writable: true });

        /**
         * @property
         * Data providers of this ViewModel instance.
         * @type {*}
         */
        Object.defineProperty(ViewModel.prototype, 'data',
        {
            get: function()
            {
                return this._data;
            },
            set: function(value)
            {
                // Create normal property directly on the object (not on the prototype).
                Object.defineProperty(this, '_data', {
                    value: value,
                    writable: true
                });

                this.viewUpdateDelegate.setDirty(DirtyType.DATA);
            }
        });

        Object.defineProperty(ViewModel.prototype, 'viewUpdateDelegate',
        {
            get: function()
            {
                if (!this._viewUpdateDelegate)
                {
                    Object.defineProperty(this, '_viewUpdateDelegate',
                    {
                        value: new ViewUpdateDelegate(this.view),
                        writable: false
                    });

                    this._viewUpdateDelegate.onUpdate = this.update.bind(this);
                }

                return this._viewUpdateDelegate;
            }
        });

        /**
         * @property
         * Indicates whether this ViewModel auto responds to window behaviors.
         * @type {bool}
         */
        Object.defineProperty(ViewModel.prototype, 'responsive',
        {
            get: function()
            {
                return this.viewUpdateDelegate.responsive;
            },
            set: function(value)
            {
                this.viewUpdateDelegate.responsive = value;
            }
        });

        /**
         * @property
         * Determines whether the view is dirty with specified dirty type(s).
         * @type {function}
         */
        Object.defineProperty(ViewModel.prototype, 'isDirty',
        {
            get: function()
            {
                return this.viewUpdateDelegate.isDirty;
            }
        });

        /**
         * @public
         * Initializes this ViewModel instance. Must manually invoke.
         */
        ViewModel.prototype.init = function()
        {
            utils.log('[ViewModel]::init()');

            this.viewUpdateDelegate.init();
        };

        /**
         * @public
         * Destroys this ViewModel instance.
         */
        ViewModel.prototype.destroy = function()
        {
            utils.log('[ViewModel]::destroy()');

            this.viewUpdateDelegate.destroy();
        };

        /**
         * @public
         * Handler invoked whenever a visual update is required.
         */
        ViewModel.prototype.update = function()
        {
            utils.log('[ViewModel]::update()');
        };

        /**
         * @protected
         * Gets the string representation of this ViewModel instance.
         * @return {string}
         */
        ViewModel.prototype.toString = function()
        {
            return '[ViewModel{' + this.name + '}]';
        };

        return ViewModel;
    }
);