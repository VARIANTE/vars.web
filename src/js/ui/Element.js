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
define([
    'enums/DirtyType',
    'enums/NodeState',
    'ui/Directives',
    'ui/ElementUpdateDelegate',
    'utils/assert',
    'utils/keyOfValue',
    'utils/log',
    'utils/sizeOf'
  ],
  function(
    DirtyType,
    NodeState,
    Directives,
    ElementUpdateDelegate,
    assert,
    keyOfValue,
    log,
    sizeOf
  ) {
    /**
     * @constructor
     *
     * Creates a new Element instance.
     *
     * @param  {Object} init Optional initial properties/element of this Element instance.
     */
    function Element(init) {
      this._nodeState = NodeState.IDLE;

      // Define instance properties.
      this.__define_properties();

      // Set instance properties per init object.
      if (init) {
        // If init object is an HTMLELement, simply assign it to the internal
        // element.
        if (init instanceof HTMLElement) {
          this.element = init;
        }
        // If init object is a VARS Element, assign its internal element to this
        // internal element.
        else if (init instanceof Element) {
          this.element = init.element;
        }
        // If init object is a regular hash object, assign each key/value pair
        // to the corresponding property of this Element instance.
        else if (typeof init === 'object') {
          for (var property in init) {
            if (this.hasOwnProperty(property)) {
              if (property === 'children') {
                var children = init.children;

                for (var childName in children) {
                  this.addChild(children[childName], childName);
                }
              }
              else {
                this[property] = init[property];
              }
            }
          }
        }
      }

      // Further extend data/properties per custom attribute.
      var attributes = this.element.attributes;
      var nAtributes = sizeOf(attributes);
      var regProperty = new RegExp('^' + Directives.Property + '-' + '|^data-' + Directives.Property + '-', 'i');
      var regData = new RegExp('^' + Directives.Data + '-' + '|^data-' + Directives.Data + '-', 'i');

      for (var i = 0; i < nAtributes; i++) {
        var a = attributes[i];

        if (regProperty.test(a.name)) {
          var pProperty = a.name.replace(regProperty, '').replace(/-([a-z])/g, function(g) {
            return g[1].toUpperCase();
          });

          Object.defineProperty(this.properties, pProperty, {
            value: (a.value === '') ? true : a.value,
            writable: true
          });
        }
        else if (regData.test(a.name)) {
          var pData = a.name.replace(regData, '').replace(/-([a-z])/g, function(g) {
            return g[1].toUpperCase();
          });

          Object.defineProperty(this.data, pData, {
            get: (function(key, val) {
              return function() {
                if (this.data[key] === undefined) {
                  return val;
                }
                else {
                  return this.data[key];
                }
              }.bind(this);
            }.bind(this)('_'+pData, (a.value === '') ? true : a.value)),
            set: (function(attr, key) {
              return function(value) {
                this.data[key] = value;
                this.element.setAttribute(attr, value);
                this.updateDelegate.setDirty(DirtyType.DATA);
              }.bind(this);
            }.bind(this)(a.name, '_'+pData))
          });
        }
      }

      log(this.toString() + ':new(', init, ')');

      this.init();
    }

    /**
     * Initializes this Element instance. Must manually invoke.
     */
    Element.prototype.init = function() {
      log(this.toString() + '::init()');

      this._nodeState = NodeState.INITIALIZED;

      this.updateDelegate.init();
    };

    /**
     * Destroys this Element instance.
     */
    Element.prototype.destroy = function() {
      log(this.toString() + '::destroy()');

      this.removeAllEventListeners();
      this.updateDelegate.destroy();

      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }

      this._nodeState = NodeState.DESTROYED;
    };

    /**
     * Handler invoked whenever a visual update is required.
     */
    Element.prototype.update = function() {
      log(this.toString() + '::update()');

      this._nodeState = NodeState.UPDATED;
    };

    /**
     * Sets up the responsiveness of the internal ElementUpdateDelegate instance.
     *
     * @param  {Object/Number}  Either the conductor or the refresh rate (if 1 argument supplied).
     * @param  {Number}         Refresh rate.
     */
    Element.prototype.responds = function() {
      var n = sizeOf(arguments);

      if (!assert(n <= 2, 'Too many arguments provided. Maximum 2 expected.')) return;

      this.updateDelegate.responsive = true;

      if (n === 1) {
        if (isNaN(arguments[0])) {
          this.updateDelegate.conductor = arguments[0];
        }
        else {
          this.updateDelegate.refreshRate = arguments[0];
        }
      }
      else if (n == 2) {
        this.updateDelegate.conductor = arguments[0];
        this.updateDelegate.refreshRate = arguments[1];
      }
    };

    /**
     * Adds a child/children to this Element instance.
     *
     * @param  {Object/Array} child/children
     * @param  {String}       The name of the child/children.
     */
    Element.prototype.addChild = function(child, name) {
      if (child.jquery) {
        this.addChild(child.get(), name);
      }
      else if (child instanceof Array) {
        var n = sizeOf(child);

        for (var i = 0; i < n; i++) {
          var c = child[i];

          this.addChild(c, name);
        }
      }
      else {
        if (!assert((child instanceof HTMLElement) || (child instanceof Element), 'Invalid child specified. Child must be an instance of HTMLElement or VARS Element.')) return;

        if (child instanceof HTMLElement) {
          child = new Element({
            element: child,
            name: name
          });
        }

        name = name || child.name;

        if (!assert(name || child.name, 'Child name must be provided.')) return null;

        if (this.children[name]) {
          if (this.children[name] instanceof Array) {
            this.children[name].push(child);
          }
          else {
            var a = [this.children[name]];
            a.push(child);
            this.children[name] = a;
          }
        }
        else {
          this.children[name] = child;
          child.name = name;
        }

        if (child.nodeState === NodeState.IDLE || child.nodeState === NodeState.DESTROYED) {
          child.init();
        }

        var shouldAddChild = true;

        if (child.element.parentNode && document) {
          var e = child.element;

          while (e !== null && e !== undefined && e !== document) {
            e = e.parentNode;

            if (e === this.element) {
              shouldAddChild = false;
              break;
            }
          }
        }

        if (shouldAddChild) {
          this.element.appendChild(child.element);
        }
      }
    };

    /**
     * Determines if this Element instance contains the specified child.
     *
     * @param  {Object} child
     *
     * @return {Boolean} True if it does, false otherwise.
     */
    Element.prototype.hasChild = function(child) {
      if (!assert(child, 'Child is null.')) return false;
      if (!assert(child instanceof Element, 'Child must be a VARS Element instance.')) return false;

      var e = child.element;

      while (e !== null && e !== undefined && e !== document) {
        e = e.parentNode;

        if (e === this.element) {
          return true;
        }
      }

      return false;
    };

    /**
     * Removes a child from this Element instance.
     *
     * @param  {Object} child
     */
    Element.prototype.removeChild = function(child) {
      if (!assert(child, 'Child is null.')) return;
      if (!assert(child instanceof Element, 'Child must conform to VARS Element.')) return;

      var key = keyOfValue(this.children, child);

      child.destroy();

      if (key) {
        delete this.children[key];
      } else {
        for (var c in this.children) {
          if (this.children[c] instanceof Array) {
            var i = this.children[c].indexOf(child);

            if (i > -1) {
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
     */
    Element.prototype.removeChildByName = function(name) {
      if (!assert(name, 'Name is null.')) return null;

      var child = this.children[name];

      if (child) {
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
    Element.prototype.getChild = function(name) {
      if (!assert(name, 'Name is null.')) return null;

      var names = name.split('.');
      var n = sizeOf(names);

      var parent = this;

      for (var i = 0; i < n; i++) {
        var child = parent.children[names[i]];

        if (child instanceof Element) {
          parent = child;
        }
        else if (child instanceof Array) {
          return child;
        }
        else {
          return null;
        }
      }

      return parent;
    };

    /**
     * @see HTMLElement#addEventListener
     */
    Element.prototype.addEventListener = function() {
      if (this.cachesListeners) {
        var event = arguments[0];
        var listener = arguments[1];
        var useCapture = arguments[2] || false;

        if (!this._listenerMap) {
          Object.defineProperty(this, '_listenerMap', {
            value: {},
            writable: false
          });
        }

        if (!this._listenerMap[event]) {
          this._listenerMap[event] = [];
        }

        var m = this._listenerMap[event];
        var n = sizeOf(m);
        var b = true;

        for (var i = 0; i < n; i++) {
          var e = m[i];

          if (e.listener === listener) {
            b = false;
            break;
          }
        }

        if (b) {
          m.push({
            listener: listener,
            useCapture: useCapture
          });
        }
      }

      return this.element.addEventListener.apply(this.element, arguments);
    };

    /**
     * Determines if a particular listener (or any listener in the specified
     * event) exist in this Element instance. For this to work this Element
     * must be configured to have 'cachesListeners' property enabled when event
     * listeners were being added.
     *
     * @param  {String}   event    Event name.
     * @param  {Function} listener Listener function.
     *
     * @return {Boolean}
     */
    Element.prototype.hasEventListener = function(event, listener) {
      if (!this._listenerMap) return false;
      if (!this._listenerMap[event]) return false;

      if (listener) {
        var m = this._listenerMap[event];
        var n = sizeOf(m);

        for (var i = 0; i < n; i++) {
          var e = m[i];

          if (e.listener === listener) return true;
        }

        return false;
      }
      else {
        return true;
      }
    };

    /**
     * @see HTMLElement#removeEventListener
     */
    Element.prototype.removeEventListener = function() {
      if (this._listenerMap) {
        var event = arguments[0];
        var listener = arguments[1];

        var m = this._listenerMap[event];
        var n = sizeOf(m);
        var s = -1;

        if (listener) {
          for (i = 0; i < n; i++) {
            var e = m[i];

            if (e.listener === listener) {
              s = i;
              break;
            }
          }

          if (s > -1) {
            m.splice(s, 1);

            if (sizeOf(m) === 0) {
              this._listenerMap[event] = null;
              delete this._listenerMap[event];
            }
          }
        }
        else {
          while (this._listenerMap[event] !== undefined) {
            this.removeEventListener(event, this._listenerMap[event][0].listener, this._listenerMap[event][0].useCapture);
          }
        }
      }

      if (arguments[1]) {
        return this.element.removeEventListener.apply(this.element, arguments);
      }
    };

    /**
     * Removes all cached event listeners from this Element instance.
     */
    Element.prototype.removeAllEventListeners = function() {
      if (this._listenerMap) {
        for (var event in this._listenerMap) {
          this.removeEventListener(event);
        }
      }
    };

    /**
     * Adds class(es) to this Element instance.
     *
     * @param  {Stirng/Array} className
     */
    Element.prototype.addClass = function(className) {
      var classes = [];

      if (!assert((typeof className === 'string') || (className instanceof Array), 'Invalid class name specified. Must be either a string or an array of strings.')) return;

      if (typeof className === 'string') {
        classes.push(className);
      }
      else {
        classes = className;
      }

      var n = sizeOf(classes);

      for (var i = 0; i < n; i++) {
        var c = classes[i];

        if (!assert(typeof c === 'string', 'Invalid class detected: ' + c)) continue;
        if (this.hasClass(c)) continue;

        this.element.className = this.element.className + ((this.element.className === '') ? '' : ' ') + c;
      }
    };

    /**
     * Removes class(es) from this Element instance.
     *
     * @param  {Stirng/Array} className
     */
    Element.prototype.removeClass = function(className) {
      var classes = [];

      if (!assert((typeof className === 'string') || (className instanceof Array), 'Invalid class name specified. Must be either a string or an array of strings.')) return;

      if (typeof className === 'string') {
        classes.push(className);
      }
      else {
        classes = className;
      }

      var n = sizeOf(classes);

      for (var i = 0; i < n; i++) {
        var c = classes[i];

        if (!assert(typeof c === 'string', 'Invalid class detected: ' + c)) continue;
        var regex = new RegExp('^' + c + '\\s+|\\s+' + c + '|^' + c + '$', 'g');
        this.element.className = this.element.className.replace(regex, '');
      }
    };

    /**
     * Determines whether this Element instance has the specified
     * class.
     *
     * @param  {String} className
     *
     * @return {Boolean}
     */
    Element.prototype.hasClass = function(className) {
      if (!assert(typeof className === 'string', 'Invalid class detected: ' + className)) return false;

      return (this.class.indexOf(className) > -1);
    };

    /**
     * Creates the associated DOM element from scratch.
     *
     * @return {Element}
     */
    Element.prototype.factory = function() {
      return document.createElement('div');
    };

    /**
     * @see ElementUpdateDelegate#isDirty
     */
    Element.prototype.isDirty = function() {
      return this.updateDelegate.isDirty.apply(this.updateDelegate, arguments);
    };

    /**
     * @see ElementUpdateDelegate#setDirty
     */
    Element.prototype.setDirty = function() {
      return this.updateDelegate.setDirty.apply(this.updateDelegate, arguments);
    };

    /**
     * Gets the string representation of this Element instance.
     *
     * @return {String}
     */
    Element.prototype.toString = function() {
      return '[Element{' + this.name + '}]';
    };

    /**
     * @protected
     *
     * Define all properties.
     */
    Element.prototype.__define_properties = function() {
      /**
       * @property
       *
       * View of this Element instance.
       *
       * @type {Object}
       */
      Object.defineProperty(this, 'element', {
        get: function() {
          if (!this._element) {
            Object.defineProperty(this, '_element', {
              value: this.factory(),
              writable: true
            });
          }

          return this._element;
        },
        set: function(value) {
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
      Object.defineProperty(this, 'id', {
        get: function() {
          return this.element.id;
        },
        set: function(value) {
          this.element.setAttribute('id', value);
        }
      });

      /**
       * @property
       *
       * Instance name of this Element instance. Once set, it cannot be changed.
       *
       * @type {String}
       */
      Object.defineProperty(this, 'name', {
        get: function() {
          var s = this.element.getAttribute(Directives.Instance) || this.element.getAttribute('data-' + Directives.Instance);

          if (!s || s === '') {
            return null;
          }
          else {
            return s;
          }
        },
        set: function(value) {
          if (!value || value === '') return;

          if (!this.name) {
            this.element.setAttribute('data-' + Directives.Instance, value);
          }
        }
      });

      /**
       * @property
       *
       * Class list of this Element instance.
       *
       * @type {Array}
       */
      Object.defineProperty(this, 'class', {
        get: function() {
          return this.element.className.split(' ');
        },
        set: function(value) {
          this.element.className = value.join(' ');
        }
      });

      /**
       * @property
       *
       * Current node state of this Element instance.
       *
       * @type {Enum}
       */
      Object.defineProperty(this, 'nodeState', {
        get: function() {
          return this._nodeState || NodeState.IDLE;
        }
      });

      /**
       * @property
       *
       * State of this Element instance (depicted by Directives.State).
       *
       * @type {String}
       */
      Object.defineProperty(this, 'state', {
        get: function() {
          var s = this.element.getAttribute(Directives.State) || this.element.getAttribute('data-' + Directives.State);

          if (!s || s === '') {
            return null;
          }
          else {
            return s;
          }
        },
        set: function(value) {
          if (this.state === value) return;

          if (value === null || value === undefined) {
            this.element.removeAttribute(Directives.State);
            this.element.removeAttribute('data-' + Directives.State);
          }
          else {
            this.element.setAttribute('data-' + Directives.State, value);
          }

          this.updateDelegate.setDirty(DirtyType.STATE);
        }
      });

      /**
       * @property
       *
       * Style of this Element instance (depicted by Directives.Style).
       *
       * @type {String}
       */
      Object.defineProperty(this, 'style', {
        get: function() {
          var s = this.element.getAttribute(Directives.Style) || this.element.getAttribute('data-' + Directives.Style);

          if (!s || s === '') {
            return null;
          }
          else {
            return s;
          }
        },
        set: function(value) {
          if (this.style === value) return;

          if (value === null || value === undefined) {
            this.element.removeAttribute(Directives.Style);
            this.element.removeAttribute('data-' + Directives.Style);
          }
          else {
            this.element.setAttribute('data-' + Directives.Style, value);
          }

          this.updateDelegate.setDirty(DirtyType.STYLE);
        }
      });

      /**
       * @property (read-only)
       *
       * Child elements.
       *
       * @type {Object}
       */
      Object.defineProperty(this, 'children', {
        value: {},
        writable: false
      });

      /**
       * @property (read-only)
       *
       * Data attributes.
       *
       * @type {Object}
       * @see ui.Directives.Data
       */
      Object.defineProperty(this, 'data', {
        value: {},
        writable: false
      });

      /**
       * @property (read-only)
       *
       * Property attributes.
       *
       * @type {Object}
       * @see ui.Directives.Property
       */
      Object.defineProperty(this, 'properties', {
        value: {},
        writable: false
      });

      /**
       * @property
       *
       * ViewUpdateDelegate instance.
       *
       * @type {ViewUpdateDelegate}
       */
      Object.defineProperty(this, 'updateDelegate', {
        get: function() {
          if (!this._updateDelegate) {
            Object.defineProperty(this, '_updateDelegate', {
              value: new ElementUpdateDelegate(this),
              writable: false
            });
          }

          return this._updateDelegate;
        }
      });

      /**
       * @property
       *
       * Specifies whether this Element instance remembers caches every listener that
       * is added to it (via the addEventListener/removeEventListener method).
       *
       * @type {Boolean}
       */
      Object.defineProperty(this, 'cachesListeners', {
        value: true,
        writable: true
      });
    };

    /**
     * @protected
     *
     * Stubbed out setter for element property (for overriding purposes).
     *
     * @param  {Object} value The DOM element.
     */
    Element.prototype.__set_element = function(value) {
      // Ensure that this is not overwritable.
      assert(!this._element, 'Element cannot be overwritten.');
      assert((value instanceof HTMLElement) || (value instanceof Element), 'Invalid element type specified. Must be an instance of HTMLElement or Element.');

      if (value instanceof Element) {
        Object.defineProperty(this, '_element', {
          value: value.element,
          writable: true
        });
      }
      else {
        Object.defineProperty(this, '_element', {
          value: value,
          writable: true
        });
      }
    };

    return Element;
  }
);
