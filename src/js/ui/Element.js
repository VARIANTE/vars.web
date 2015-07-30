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
        'enums/DirtyType',
        'ui/Directives',
        'ui/ElementUpdateDelegate',
        'utils/assert',
        'utils/keyOfValue',
        'utils/log',
        'utils/sizeOf'
    ],
    function
    (
        DirtyType,
        Directives,
        ElementUpdateDelegate,
        assert,
        keyOfValue,
        log,
        sizeOf
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
            // Define instance properties.
            this.__define_properties();

            // Set instance properties per init object.
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

            // Further define instance properties per custom attribute.
            var attributes = this.element.attributes;
            var nAtributes = sizeOf(attributes);
            var reg = new RegExp('^'+Directives.Property+'-'+'|^data-'+Directives.Property+'-', 'i');

            for (var i = 0; i < nAtributes; i++)
            {
                if (reg.test(attributes[i].name))
                {
                    var a = attributes[i];
                    var p = a.name.replace(reg, '').replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });

                    Object.defineProperty(this, p, { value: (a.value === '') ? true : a.value, writable: true });
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
         * Sets up the responsiveness of the internal ElementUpdateDelegate instance.
         *
         * @param  {Object/Number}  Either the conductor or the refresh rate (if 1 argument supplied).
         * @param  {Number}         Refresh rate.
         */
        Element.prototype.responds = function()
        {
            var n = sizeOf(arguments);

            if (!assert(n <= 2, 'Too many arguments provided. Maximum 2 expected.')) return;

            this.updateDelegate.responsive = true;

            if (n === 1)
            {
                if (isNaN(arguments[0]))
                {
                    this.updateDelegate.conductor = arguments[0];
                }
                else
                {
                    this.updateDelegate.refreshRate = arguments[0];
                }
            }
            else if (n == 2)
            {
                this.updateDelegate.conductor = arguments[0];
                this.updateDelegate.refreshRate = arguments[1];
            }
        };

        /**
         * Adds a child/children to this Element instance.
         *
         * @param  {Object/Array} child
         * @param  {Object}       The added child.
         */
        Element.prototype.addChild = function(child, name)
        {
            if (child instanceof Array)
            {
                var n = sizeOf(child);

                for (var i = 0; i < n; i++)
                {
                    var c = child[i];

                    this.addChild(c, name);
                }
            }
            else
            {
                if (!assert(child instanceof Element, 'Child must conform to VARS Element.')) return null;

                name = name || child.name;

                if (!assert(name || child.name, 'Child name must be provided.')) return null;

                if (this.children[name])
                {
                    if (this.children[name] instanceof Array)
                    {
                        this.children[name].push(child);
                    }
                    else
                    {
                        var a = [this.children[name]];
                        a.push(child);
                        this.children[name] = a;
                    }
                }
                else
                {
                    this.children[name] = child;
                    child.name = name;
                }
            }
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
            else
            {
                for (var c in this.children)
                {
                    if (this.children[c] instanceof Array)
                    {
                        var i = this.children[c].indexOf(child);

                        if (i > -1)
                        {
                            this.children[c].splice(i, 1);
                        }
                    }
                }
            }
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
        };

        /**
         * Gets a child by its name (depth separated by .). If child is
         * an array, it will be returned immediately.
         *
         * @param  {string} name
         *
         * @return {Object} The fetched child.
         */
        Element.prototype.getChild = function(name)
        {
            if (!assert(name, 'Name is null.')) return null;

            var names = name.split('.');
            var n = sizeOf(names);

            var parent = this;

            for (var i = 0; i < n; i++)
            {
                var child = parent.children[names[i]];

                if (child instanceof Element)
                {
                    parent = child;
                }
                else if (child instanceof Array)
                {
                    return child;
                }
                else
                {
                    return null;
                }
            }

            return parent;
        };

        /**
         * @see HTMLElement#addEventListener
         */
        Element.prototype.addEventListener = function()
        {
            return this.element.addEventListener.apply(this.element, arguments);
        };

        /**
         * @see HTMLElement#removeEventListener
         */
        Element.prototype.removeEventListener = function()
        {
            return this.element.removeEventListener.apply(this.element, arguments);
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
             * @type {Array}
             */
            Object.defineProperty(this, 'classList',
            {
                get: function()
                {
                    return this.element.className.split(' ');
                },
                set: function(value)
                {
                    this.element.className = value.join(' ');
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
