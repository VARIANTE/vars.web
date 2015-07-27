/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Controller of a DOM element.
 *
 * @type {Class}
 */
define
(
    [
        'utils/assert',
        'utils/log',
        'utils/keyOfValue',
        'utils/sizeOf',
        'enums/DirtyType',
        'ui/ElementUpdateDelegate'
    ],
    function
    (
        assert,
        log,
        keyOfValue,
        sizeOf,
        DirtyType,
        ElementUpdateDelegate
    )
    {
        /**
         * @constructor
         *
         * Creates a new Element instance.
         *
         * @param  {Object} init Optional initial properties/element of this Element instance.
         */
        function Element(init)
        {
            this.__define_properties();

            if (init)
            {
                if (init instanceof HTMLElement)
                {
                    this.element = init;
                }
                else if (init instanceof Element)
                {
                    this.element = init.element;
                }
                else if (typeof init === 'object')
                {
                    for (var property in init)
                    {
                        if (this.hasOwnProperty(property))
                        {
                            if (property === 'children')
                            {
                                var children = init.children;

                                for (var childName in children)
                                {
                                    this.addChild(children[childName], childName);
                                }
                            }
                            else
                            {
                                this[property] = init[property];
                            }
                        }
                    }
                }
            }

            log(this.toString()+':new(', init, ')');

            this.init();
        }

        /**
         * Initializes this Element instance. Must manually invoke.
         */
        Element.prototype.init = function()
        {
            log(this.toString()+'::init()');

            this.updateDelegate.init();
        };

        /**
         * Destroys this Element instance.
         */
        Element.prototype.destroy = function()
        {
            log(this.toString()+'::destroy()');

            this.updateDelegate.destroy();
        };

        /**
         * Handler invoked whenever a visual update is required.
         */
        Element.prototype.update = function()
        {
            log(this.toString()+'::update()');
        };

        /**
         * Adds a child to this Element instance.
         *
         * @param  {Object} child
         * @param  {Object} The added child.
         */
        Element.prototype.addChild = function(child, name)
        {
            if (!assert(child instanceof Element, 'Child must conform to VARS Element.')) return null;

            name = name || child.name;

            if (!assert(name || child.name, 'Child name must be provided.')) return null;
            if (!assert(!this.children[name], 'Child name is already taken.')) return null;

            this.children[name] = child;
            child.name = name;

            return child;
        };

        /**
         * Removes a child from this Element instance.
         *
         * @param  {Object} child
         *
         * @return {Object} The removed child.
         */
        Element.prototype.removeChild = function(child)
        {
            if (!assert(child, 'Child is null.')) return null;
            if (!assert(child instanceof Element, 'Child must conform to VARS Element.')) return null;

            var key = keyOfValue(this.children, child);

            if (key)
            {
                delete this.children[key];
            }

            return child;
        };

        /**
         * Removes a child by its name.
         *
         * @param  {String} name
         *
         * @return {Object} The removed child.
         */
        Element.prototype.removeChildByName = function(name)
        {
            if (!assert(name, 'Name is null.')) return null;

            var child = this.children[name];

            if (child)
            {
                delete this.children[name];
            }

            return child;
        };

        /**
         * Creates the associated DOM element from scratch.
         *
         * @return {Element}
         */
        Element.prototype.factory = function()
        {
            return document.createElement('div');
        };

        /**
         * @public
         *
         * Gets the string representation of this Element instance.
         *
         * @return {String}
         */
        Element.prototype.toString = function()
        {
            return '[Element{' + this.name + '}]';
        };

        /**
         * @protected
         *
         * Define all properties.
         */
        Element.prototype.__define_properties = function()
        {
            /**
             * @property
             *
             * View of this Element instance.
             *
             * @type {Object}
             */
            Object.defineProperty(this, 'element',
            {
                get: function()
                {
                    if (!this._element)
                    {
                        Object.defineProperty(this, '_element', { value: this.factory(), writable: true });
                    }

                    return this._element;
                },
                set: function(value)
                {
                    this.__set_element(value);
                }
            });

            /**
             * @property
             *
             * ID of this Element instance.
             *
             * @type {String}
             */
            Object.defineProperty(this, 'id',
            {
                get: function()
                {
                    return this.element.id;
                },
                set: function(value)
                {
                    this.element.setAttribute('id', value);
                }
            });

            /**
             * @property
             *
             * Instance name of this Element instance.
             *
             * @type {String}
             */
            Object.defineProperty(this, 'name', { value: null, writable: true });

            /**
             * @property
             *
             * Class of this Element instance.
             *
             * @type {String}
             */
            Object.defineProperty(this, 'class',
            {
                get: function()
                {
                    return this.element.className;
                },
                set: function(value)
                {
                    this.element.className = value;
                }
            });

            /**
             * @property
             *
             * Class list of this Element instance.
             *
             * @type {String}
             */
            Object.defineProperty(this, 'classList',
            {
                get: function()
                {
                    return this.element.classList;
                },
                set: function(value)
                {
                    this.element.classList = value;
                }
            });

            /**
             * @property (read-only)
             *
             * Child elements.
             *
             * @type {Object}
             */
            Object.defineProperty(this, 'children', { value: {}, writable: false });

            /**
             * @property
             *
             * Specifies the data providers of this Element instance.
             *
             * @type {*}
             */
            Object.defineProperty(this, 'data',
            {
                get: function()
                {
                    return this._data;
                },
                set: function(value)
                {
                    Object.defineProperty(this, '_data', { value: value, writable: true });

                    this.updateDelegate.setDirty(DirtyType.DATA);
                }
            });

            /**
             * @property
             *
             * ViewUpdateDelegate instance.
             *
             * @type {ViewUpdateDelegate}
             */
            Object.defineProperty(this, 'updateDelegate',
            {
                get: function()
                {
                    if (!this._updateDelegate)
                    {
                        Object.defineProperty(this, '_updateDelegate', { value: new ElementUpdateDelegate(this), writable: false });
                    }

                    return this._updateDelegate;
                }
            });
        };

        /**
         * @protected
         *
         * Stubbed out setter for element property (for overriding purposes).
         *
         * @param  {Object} value The DOM element.
         */
        Element.prototype.__set_element = function(value)
        {
            // Ensure that this is not overwritable.
            assert(!this._element, 'Element cannot be overwritten.');
            assert((value instanceof HTMLElement) || (value instanceof Element), 'Invalid element type specified. Must be an instance of HTMLElement or Element.');

            if (value instanceof Element)
            {
                Object.defineProperty(this, '_element', { value: value.element, writable: true });
            }
            else
            {
                Object.defineProperty(this, '_element', { value: value, writable: true });
            }
        };

        return Element;
    }
);
