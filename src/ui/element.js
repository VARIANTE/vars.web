/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  View model of any DOM element.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define(['utils/assert', 'utils/log', 'enums/dirtytype', 'ui/elementupdatedelegate'], function(assert, log, DirtyType, ElementUpdateDelegate) {

/**
 * @constructor
 * Creates a new Element instance.
 */
function Element(element)
{
    if (this.debug) log('[Element]::new(', element, ')');

    this.element = element;

    this.init();
}

/**
 * @property
 * View of this Element instance.
 * @type {Object}
 */
Object.defineProperty(Element.prototype, 'element',
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
        // Ensure that this is not overwritable.
        assert(!this._element, 'Element cannot be overwritten.');

        Object.defineProperty(this, '_element', { value: value, writable: true });

        this.updateDelegate.element = value;
    }
});

/**
 * @property
 * ID of this Element instance.
 * @type {String}
 */
Object.defineProperty(Element.prototype, 'id',
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
 * Class of this Element instance.
 * @type {String}
 */
Object.defineProperty(Element.prototype, 'class',
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
 * Specifies whether this Element instance generates debug data.
 * @type {Object}
 */
Object.defineProperty(Element.prototype, 'debug',
{
    get: function()
    {
        return this._debug;
    },
    set: function(value)
    {
        Object.defineProperty(this, '_debug', { value: value, writable: true });

        this.updateDelegate.debug = value;
    }
});

/**
 * @property
 * Specifies the data providers of this Element instance.
 * @type {*}
 */
Object.defineProperty(Element.prototype, 'data',
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
 * ViewUpdateDelegate instance.
 * @type {ViewUpdateDelegate}
 */
Object.defineProperty(Element.prototype, 'updateDelegate',
{
    get: function()
    {
        if (!this._updateDelegate)
        {
            Object.defineProperty(this, '_updateDelegate', { value: new ElementUpdateDelegate(this.element), writable: false });

            this._updateDelegate.update(this.update.bind(this));
        }

        return this._updateDelegate;
    }
});

/**
 * @property
 * Specifies whether this Element auto responds to window behaviors.
 * @type {Boolean}
 */
Object.defineProperty(Element.prototype, 'responsive',
{
    get: function()
    {
        return this.updateDelegate.responsive;
    },
    set: function(value)
    {
        this.updateDelegate.responsive = value;
    }
});

/**
 * @property
 * Determines whether the element is dirty with specified dirty type(s).
 * @type {Function}
 */
Object.defineProperty(Element.prototype, 'isDirty',
{
    get: function()
    {
        return this.updateDelegate.isDirty;
    }
});

/**
 * @public
 * Initializes this Element instance. Must manually invoke.
 */
Element.prototype.init = function()
{
    if (this.debug) log('[Element]::init()');

    this.updateDelegate.init();
};

/**
 * @public
 * Destroys this Element instance.
 */
Element.prototype.destroy = function()
{
    if (this.debug) log('[Element]::destroy()');

    this.updateDelegate.destroy();
};

/**
 * @public
 * Handler invoked whenever a visual update is required.
 */
Element.prototype.update = function()
{
    if (this.debug) log('[Element]::update()');
};

/**
 * @public
 * Creates the associated DOM element from scratch.
 * @return {Element}
 */
Element.prototype.factory = function()
{
    return document.createElement('div');
};

/**
 * @protected
 * Gets the string representation of this Element instance.
 * @return {String}
 */
Element.prototype.toString = function()
{
    return '[Element{' + this.name + '}]';
};

return Element; });