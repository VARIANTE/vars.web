/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Start file for r.js.
 */
(function(root, factory, undefined) {
  var vars = factory;

  // Check if using AMD.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = vars;
  }
  // Browser (?).
  else {
    root.vars = vars;
  }
}((typeof window !== 'undefined') ? window : this, function() {
/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * UI dirty types.
 *
 * @type {Object}
 */
define('enums/DirtyType',{
  NONE: 0x00000000,
  POSITION: 1 << 0,
  SIZE: 1 << 1,
  LAYOUT: 1 << 2,
  STATE: 1 << 3,
  DATA: 1 << 4,
  LOCALE: 1 << 5,
  DEPTH: 1 << 6,
  CONFIG: 1 << 7,
  STYLE: 1 << 8,
  CUSTOM: 1 << 9,
  ALL: 0xFFFFFFFF
});

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Element node states.
 *
 * @type {Object}
 */
define('enums/NodeState',{
  /**
   * Element is instantiated but not initialized yet. This state
   * almost never persists.
   */
  IDLE: 0,

  /**
   * Element is initialized, but not updated yet.
   */
  INITIALIZED: 1,

  /**
   * Element is updated at least once.
   */
  UPDATED: 2,

  /**
   * Element is destroyed.
   */
  DESTROYED: 3
});

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Module of global VARS enums.
 *
 * @type {Module}
 */
define('enums',[
    'enums/DirtyType',
    'enums/NodeState'
  ],
  function(
    DirtyType,
    NodeState
  ) {
    var api = function(obj) {
      return obj;
    };

    Object.defineProperty(api, 'DirtyType', { value: DirtyType, writable: false, enumerable: true });
    Object.defineProperty(api, 'NodeState', { value: NodeState, writable: false, enumerable: true });

    return api;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('utils/assert',[],
  function() {
    /**
     * Asserts the specified condition and throws a warning if assertion fails. Internal use
     * only.
     *
     * @param  {Boolean}    condition   Condition to validate against.
     * @param  {String}     message     (Optional) Message to be displayed when assertion fails.
     *
     * @return {Boolean} True if assert passed, false otherwise.
     */
    function assert(condition, message) {
      if (!condition && (window && window.vars && window.VARS_DEBUG)) {
        throw new Error((message || 'Assertion failed'));
      }

      return condition;
    }

    return assert;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('utils/log',[],
  function() {
    /**
     * Internal logger to console if debug mode is on.
     */
    function log() {
      if (window && window.VARS_DEBUG && window.console && console.log) {
        Function.apply.call(console.log, console, arguments);
      }
    }

    return log;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Event dispatcher object.
 *
 * @type {Class}
 */
define(
  'events/EventDispatcher',[
    'utils/assert',
    'utils/log'
  ],
  function(
    assert,
    log
  ) {
    /**
     * @constructor
     *
     * Creates a new EventDispatcher instance.
     */
    function EventDispatcher(element) {
      this.__define_properties();
    }

    /**
     * Adds an event listener to this EventDispatcher instance.
     *
     * @param  {String} type
     * @param  {Function} listener
     */
    EventDispatcher.prototype.addEventListener = function(type, listener) {
      assert(type, 'Event type must be specified.');
      assert(listener, 'Listener must be specified.');

      if (!type) return;
      if (!listener) return;

      log('[EventDispatcher]::addEventListener(' + type + ')');

      if (!this._listenerMap) {
        Object.defineProperty(this, '_listenerMap', {
          value: {},
          writable: true
        });
      }

      if (!this._listenerMap[type]) {
        this._listenerMap[type] = [];
      }

      this._listenerMap[type].push(listener);
    };

    /**
     * Removes an event listener from this EventDispatcher instance. If no listener method is
     * specified, all the listeners of the specified type will be removed.
     *
     * @param  {String} type
     * @param  {Function} listener (Optional)
     */
    EventDispatcher.prototype.removeEventListener = function(type, listener) {
      assert(type, 'Event type must be specified.');
      assert(this._listenerMap, 'Listener map is null.');
      assert(this._listenerMap[type], 'There are no listeners registered for event type: ' + type);

      if (!type) return;
      if (!this._listenerMap) return;
      if (!this._listenerMap[type]) return;

      log('[EventDispatcher]::removeEventListener(' + type + ')');

      if (listener) {
        var index = this._listenerMap[type].indexOf(listener);

        if (index > -1) {
          this._listenerMap[type].splice(index, 1);
        }
      } else {
        delete this._listenerMap[type];
      }
    };

    /**
     * Determines whether this EventDispatcher instance has a specific event listener registered.
     * If no listener is specified, it will check if any listener of the specified event type
     * is registered.
     *
     * @param  {String} type
     * @param  {Function} listener (Optional)
     *
     * @return {Boolean}
     */
    EventDispatcher.prototype.hasEventListener = function(type, listener) {
      assert(type, 'Event type must be specified.');
      assert(this._listenerMap, 'Listener map is null.');
      assert(this._listenerMap[type], 'There are no listeners registered for event type: ' + type);

      if (!type) return false;
      if (!this._listenerMap) return false;
      if (!this._listenerMap[type]) return false;

      if (listener) {
        var index = this._listenerMap[type].indexOf(listener);

        return (index > -1);
      } else {
        return true;
      }
    };

    /**
     * Dispatches the specified event.
     *
     * @param  {String} event
     */
    EventDispatcher.prototype.dispatchEvent = function(event) {
      assert(event, 'Event must be specified.');
      assert(this._listenerMap, 'Listener map is null.');

      if (!event) return;
      if (!this._listenerMap) return false;
      if (!this._listenerMap[event.type]) return false;

      log('[EventDispatcher]::dispatchEvent(' + event.type + ')');

      event.target = this;
      event.currentTarget = this;
      event.customTarget = this;

      var arrlen = this._listenerMap[event.type].length;

      for (var i = 0; i < arrlen; i++) {
        var listener = this._listenerMap[event.type][i];

        listener.call(this, event);
      }
    };

    /**
     * @private
     *
     * Defines all properties.
     */
    EventDispatcher.prototype.__define_properties = function() {

    };

    return EventDispatcher;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * VARS supported event types.
 *
 * @type {Object}
 */
define('events/EventType',{
  /**
   * DOM native events.
   *
   * @see http://www.w3schools.com/jsref/dom_obj_event.asp
   */
  MOUSE: {
    CLICK: 'click',
    CONTEXT_MENU: 'contextmenu',
    DOUBLE_CLICK: 'dblclick',
    MOUSE_DOWN: 'mousedown',
    MOUSE_ENTER: 'mouseenter',
    MOUSE_LEAVE: 'mouseleave',
    MOUSE_MOVE: 'mousemove',
    MOUSE_OVER: 'mouseover',
    MOUSE_OUT: 'mouseout',
    MOUSE_UP: 'mouseup'
  },
  KEYBOARD: {
    KEY_DOWN: 'keydown',
    KEY_PRESS: 'keypress',
    KEY_UP: 'keyup'
  },
  OBJECT: {
    ABORT: 'abort',
    BEFORE_UNLOAD: 'beforeunload',
    ERROR: 'error',
    HASH_CHANGE: 'hashchange',
    LOAD: 'load',
    PAGE_SHOW: 'pageshow',
    PAGE_HIDE: 'pagehide',
    RESIZE: 'resize',
    SCROLL: 'scroll',
    UNLOAD: 'unload',
    PROGRESS: 'progress' // custom
  },
  FORM: {
    BLUR: 'blur',
    CHANGE: 'change',
    FOCUS: 'focus',
    FOCUS_IN: 'focusin',
    FOCUS_OUT: 'focusout',
    INPUT: 'input',
    INVALID: 'invalid',
    RESET: 'reset',
    SEARCH: 'search',
    SELECT: 'select',
    SUBMIT: 'submit'
  },
  DRAG: {
    DRAG: 'drag',
    DRAG_END: 'dragend',
    DRAG_ENTER: 'dragenter',
    DRAG_LEAVE: 'dragleave',
    DRAG_OVER: 'dragover',
    DRAG_START: 'dragstart',
    DROP: 'drop'
  },
  CLIPBOARD: {
    COPY: 'copy',
    CUT: 'cut',
    PASTE: 'paste'
  },
  PRINT: {
    AFTER_PRINT: 'afterprint',
    BEFORE_PRINT: 'beforeprint'
  },
  MEDIA: {
    ABORT: 'abort',
    CAN_PLAY: 'canplay',
    CAN_PLAY_THROUGH: 'canplaythrough',
    DURATION_CHANGE: 'durationchange',
    EMPTIED: 'emptied',
    ENDED: 'ended',
    ERROR: 'error',
    LOADED_DATA: 'loadeddata',
    LOADED_METADATA: 'loadedmetadata',
    LOAD_START: 'loadstart',
    PAUSE: 'pause',
    PLAY: 'play',
    PLAYING: 'playing',
    PROGRESS: 'progress',
    RATE_CHANGE: 'ratechange',
    SEEKED: 'seeked',
    SEEKING: 'seeking',
    STALLED: 'stalled',
    SUSPEND: 'suspend',
    TIME_UPDATE: 'timeupdate',
    VOLUME_CHANGE: 'volumechange',
    WAITING: 'waiting'
  },
  ANIMATION: {
    ANIMATION_END: 'animationend',
    ANIMATION_ITERATION: 'animationiteration',
    ANIMATION_START: 'animationstart'
  },
  TRANSITION: {
    TRANSITION_END: 'transitionend'
  },
  SERVER_SENT: {
    ERROR: 'error',
    MESSAGE: 'message',
    OPEN: 'open'
  },
  MISC: {
    MESSAGE: 'message',
    ONLINE: 'online',
    OFFLINE: 'offline',
    POP_STATE: 'popstate',
    SHOW: 'show',
    STORAGE: 'storage',
    TOGGLE: 'toggle',
    WHEEL: 'wheel'
  },
  TOUCH: {
    TOUCH_CANCEL: 'touchcancel',
    TOUCH_END: 'touchend',
    TOUCH_MOVE: 'touchmove',
    TOUCH_START: 'touchstart'
  }
});

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Module of methods/classes related to the native event system.
 *
 * @type {Module}
 */
define('events',[
    'events/EventDispatcher',
    'events/EventType'
  ],
  function(
    EventDispatcher,
    EventType
  ) {
    var api = function(obj) {
      return obj;
    };

    Object.defineProperty(api, 'EventDispatcher', { value: EventDispatcher, writable: false, enumerable: true });
    Object.defineProperty(api, 'EventType', { value: EventType, writable: false, enumerable: true });

    return api;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('math/clamp',[
  ],
  function() {
    /**
     * Clamps a value to a min and max value.
     *
     * @param  {Number} value
     * @param  {Number} min
     * @param  {Number} max
     *
     * @return {Number} The clamped value.
     */
    function clamp(value, min, max) {
      if ((typeof value !== 'number') || (typeof min !== 'number') || (typeof max !== 'number')) return NaN;

      var output = value;

      output = Math.min(output, max);
      output = Math.max(output, min);

      return output;
    }

    return clamp;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('math/isClamped',[
  ],
  function() {
    /**
     * Determines if value is bounded by the specified min and max values, defaults to inclusive.
     *
     * @param  {Number} value
     * @param  {Number} min
     * @param  {Number} max
     * @param  {Boolean} exclusive
     *
     * @return {Boolean} True if bounded, false otherwise.
     */
    function isClamped(value, min, max, exclusive) {
      if (exclusive) {
        return ((value > min) && (value < max));
      }
      else {
        return ((value >= min) && (value <= max));
      }
    }

    return isClamped;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Module of methods/classes related to math.
 *
 * @type {Module}
 */
define('math',[
    'math/clamp',
    'math/isClamped'
  ],
  function(
    clamp,
    isClamped
  ) {
    var api = function(obj) {
      return obj;
    };

    Object.defineProperty(api, 'clamp', { value: clamp, writable: false, enumerable: true });
    Object.defineProperty(api, 'isClamped', { value: isClamped, writable: false, enumerable: true });

    return api;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Custom DOM directives used by VARS.
 *
 * @type {Object}
 */
define('ui/Directives',{
  Controller: 'vs-controller',
  Instance: 'vs-instance',
  Property: 'vs-property',
  Data: 'vs-data',
  State: 'vs-state',
  Style: 'vs-style'
});

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('utils/debounce',[],
  function() {
    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If 'immediate' is passed, trigger the function on the
     * leading edge, instead of the trailing.
     *
     * @param  {Function}   method      Method to be debounced.
     * @param  {Number}     delay       Debounce rate in milliseconds.
     * @param  {Boolean}    immediate   (Optional) Indicates whether the method is triggered
     *                                  on the leading edge instead of the trailing.
     *
     * @return {Function} The debounced method.
     */
    function debounce(method, delay, immediate) {
      var timeout;

      return function() {
        var context = this;
        var args = arguments;

        var later = function() {
          timeout = null;

          if (!immediate) {
            method.apply(context, args);
          }
        };

        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, delay);

        if (callNow) {
          method.apply(context, args);
        }
      };
    }

    return debounce;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('utils/sizeOf',[],
  function() {
    /**
     * Gets the number of keys in a given object.
     *
     * @param  {*} object   Any object type.
     *
     * @return {Number} Size of specified object (depending on the object type,
     *                  it can be the number of keys in a plain object, number
     *                  of elements in an array, number of characters in a
     *                  string, number of digits in a number, and 0 for all
     *                  other types.
     */
    function sizeOf(object) {
      if (object === undefined || object === null) return 0;

      // If object internally has length property, use it.
      if (object.length !== undefined) return object.length;

      var size = 0;

      switch (typeof object) {
        case 'object': {
          if (object !== null && object !== undefined) {
            for (var k in object) size++;
          }

          break;
        }

        case 'number': {
          size = ('' + object).length;
          break;
        }

        default: {
          size = 0;
          break;
        }
      }

      return size;
    }

    return sizeOf;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Delegate for managing update calls of a VARS modeled element.
 *
 * @type {Class}
 */
define('ui/ElementUpdateDelegate',[
    'enums/DirtyType',
    'utils/assert',
    'utils/debounce',
    'utils/log',
    'utils/sizeOf'
  ],
  function(
    DirtyType,
    assert,
    debounce,
    log,
    sizeOf
  ) {
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
    function ElementUpdateDelegate(delegate) {
      log('[ElementUpdateDelegate]::new(', delegate, ')');

      var mDirtyTable = 0;
      var mResizeHandler = null;
      var mScrollHandler = null;

      this.delegate = delegate;

      /**
       * @privileged
       *
       * Sets a dirty type as dirty.
       *
       * @param  {Number} dirtyType
       */
      this.setDirty = function(dirtyType, validateNow) {
        log('[ElementUpdateDelegate]::setDirty(', dirtyType, validateNow, ')');

        if (this.transmissive !== DirtyType.NONE) {
          if (this.delegate.children) {
            for (var name in this.delegate.children) {
              var children;

              if (this.delegate.children[name] instanceof Array) {
                children = this.delegate.children[name];
              } else {
                children = [this.delegate.children[name]];
              }

              var n = sizeOf(children);

              for (var i = 0; i < n; i++) {
                var child = children[i];

                if (child.updateDelegate && child.updateDelegate.setDirty) {
                  var transmitted = dirtyType & child.updateDelegate.receptive;

                  if (transmitted !== DirtyType.NONE) {
                    child.updateDelegate.setDirty(transmitted, validateNow);
                  }
                }
              }
            }
          }
        }

        if (this.isDirty(dirtyType) && !validateNow) {
          return;
        }

        switch (dirtyType) {
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

        if (validateNow) {
          this.update();
        } else if (!this._pendingAnimationFrame) {
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
      this.isDirty = function(dirtyType) {
        log('[ElementUpdateDelegate]::isDirty(', dirtyType, mDirtyTable, ')');

        switch (dirtyType) {
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
      this.init = function() {
        log('[ElementUpdateDelegate]::init()');

        var r = this.conductor || window;

        if (window && r && r.addEventListener && this.responsive) {
          if (this.refreshRate === 0.0) {
            mResizeHandler = _onWindowResize.bind(this);
            mScrollHandler = _onWindowScroll.bind(this);
          } else {
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
      this.destroy = function() {
        log('[ElementUpdateDelegate]::destroy()');

        _cancelAnimationFrame();

        var r = this.conductor || window;

        if (window && r && r.removeEventListener && this.responsive) {
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
      this.update = function() {
        log('[ElementUpdateDelegate]::update()');

        _cancelAnimationFrame(this._pendingAnimationFrame);

        if (this.delegate && this.delegate.update) {
          this.delegate.update.call(this.delegate);
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
      var _requestAnimationFrame = function(callback) {
        var raf = window && (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame) || null;

        if (!raf) {
          raf = function(callback) {
            if (window) {
              return window.setTimeout(callback, 10.0);
            } else {
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
      var _cancelAnimationFrame = function(callback) {
        var caf = window && (window.requestAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame) || null;

        if (!caf) {
          caf = function(callback) {
            if (window) {
              return window.clearTimeout(callback);
            } else {
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
      var _onWindowResize = function(event) {
        this.setDirty(DirtyType.SIZE);
      };

      /**
       * @private
       *
       * Handler invoked when the window scrolls.
       *
       * @param  {Object} event
       */
      var _onWindowScroll = function(event) {
        this.setDirty(DirtyType.POSITION);
      };
    }

    /**
     * @property
     *
     * Delegate of this ElementUpdateDelegate instance.
     *
     * @type {Object}
     */
    Object.defineProperty(ElementUpdateDelegate.prototype, 'delegate', {
      value: null,
      writable: true
    });

    /**
     * @property
     *
     * Indicates whether this ElementUpdateDelegate auto responds to window behaviors.
     *
     * @type {Boolean}
     */
    Object.defineProperty(ElementUpdateDelegate.prototype, 'responsive', {
      value: false,
      writable: true
    });

    /**
     * @property
     *
     * Indicates the debounce rate of this ElementUpdateDelegate instance.
     *
     * @type {Number}
     */
    Object.defineProperty(ElementUpdateDelegate.prototype, 'refreshRate', {
      value: DEFAULT_REFRESH_RATE,
      writable: true
    });

    /**
     * @property
     *
     * Indicates the dirty flags in which ElementUpdateDelgate instance will transmit to its child instances.
     *
     * @type {Number}
     */
    Object.defineProperty(ElementUpdateDelegate.prototype, 'transmissive', {
      value: DirtyType.NONE,
      writable: true
    });

    /**
     * @property
     *
     * Indicates the dirty flags in which this ElementUpdateDelegate is capable of receiving.
     *
     * @type {Number}
     */
    Object.defineProperty(ElementUpdateDelegate.prototype, 'receptive', {
      value: DirtyType.NONE,
      writable: true
    });

    /**
     * @property
     *
     * Indicates the conductor in which this ElementUpdateDelegate responds to (defaults to window).
     *
     * @type {Object}
     */
    Object.defineProperty(ElementUpdateDelegate.prototype, 'conductor', {
      value: window,
      writable: true
    });

    /**
     * @protected
     *
     * Gets the string representation of this ElementUpdateDelegate instance.
     *
     * @return {String}
     */
    ElementUpdateDelegate.prototype.toString = function() {
      return '[ElementUpdateDelegate{' + ((this.delegate && this.delegate.name) || 'undefined') + '}]';
    };

    return ElementUpdateDelegate;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('utils/keyOfValue',[],
  function() {
    /**
     * Gets the key of a given value in a given object.
     *
     * @param  {Object} object  Target object.
     * @param  {Value}  value   Target value.
     */
    function keyOfValue(object, value) {
      if (!object || !value) return null;
      if (typeof object !== 'object') return null;

      for (var property in object) {
        if (object.hasOwnProperty(property)) {
          if (object[property] === value) {
            return property;
          }
        }
      }

      return null;
    }

    return keyOfValue;
  }
);

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
define('ui/Element',[
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
          var _pData = '_'+pData;
          var val = a.value;

          Object.defineProperty(this.data, pData, {
            get: function() {
              if (!this.data[_pData]) {
                return val;
              }
              else {
                return this.data[_pData];
              }
            }.bind(this),
            set: function(value) {
              this.data[_pData] = value;
              this.updateDelegate.setDirty(DirtyType.DATA);
            }.bind(this)
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

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/getClassIndex',[
    'ui/Element',
    'utils/assert'
  ],
  function(
    Element,
    assert
  ) {
    /**
     * Gets the index of a specified class in a DOM element,
     *
     * @param  {Object} element     HTMLElement, VARS Element, or jQuery object.
     * @param  {String} className
     *
     * @return {Number} Index of given class name. -1 if not found.
     */
    function getClassIndex(element, className) {
      if (!assert((element) && ((element instanceof HTMLElement) || (element instanceof Element) || (element.jquery)), 'Invalid element specified. Element must be an instance of HTMLElement or Element.')) return null;
      if (element instanceof Element) element = element.element;
      if (element.jquery) element = element.get(0);

      if (!assert(className && (typeof className === 'string'), 'Invalid class name: ' + className)) return -1;

      var classList = element.className.split(' ');

      return classList.indexOf(className);
    }

    return getClassIndex;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/toElementArray',[
    'ui/Element',
    'utils/assert',
    'utils/sizeOf'
  ],
  function(
    Element,
    assert,
    sizeOf
  ) {
    /**
     * Transforms given element(s) to an element array.
     *
     * @param  {Object/Array} element
     * @param  {Boolean}      keepElement
     */
    function toElementArray(element, keepElement) {
      if (!assert(element, 'Element is undefined or null.')) return null;

      var elements;

      if (element instanceof Array) {
        elements = element;
      }
      else if (element instanceof NodeList) {
        elements = Array.prototype.slice.call(element);
      }
      else if (element.jquery) {
        elements = element.get();
      }
      else {
        if (!assert((element instanceof HTMLElement) || (element instanceof Element), 'Invalid element specified. Element must be an instance of HTMLElement or VARS Element.')) return null;

        if (element instanceof HTMLElement) {
          elements = [element];
        }
        else if (element instanceof Element) {
          elements = [element.element];
        }
      }

      var n = sizeOf(elements);

      for (var i = 0; i < n; i++) {
        var e = elements[i];

        if (!assert((e instanceof HTMLElement) || (e instanceof Element), 'Element array contains invalid element(s). Each element must be an instance of HTMLElement or VARS Element.')) return null;

        if (!keepElement && (e instanceof Element)) {
          elements[i] = e.element;
        }
      }

      return elements;
    }

    return toElementArray;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/hasClass',[
    'ui/getClassIndex',
    'ui/toElementArray',
    'ui/Element',
    'utils/assert',
    'utils/sizeOf'
  ],
  function(
    getClassIndex,
    toElementArray,
    Element,
    assert,
    sizeOf
  ) {
    /**
     * Verifies that the specified element(s) has the specified class.
     *
     * @param  {Object/Array} element   HTMLElement, VARS Element, or jQuery object.
     * @param  {String}       className
     *
     * @return {Boolean} True if element(s) has given class, false otherwise.
     */
    function hasClass(element, className) {
      if (!assert(className && (typeof className === 'string'), 'Invalid class name: ' + className)) return false;

      var elements = toElementArray(element);
      var n = sizeOf(elements);

      for (var i = 0; i < n; i++) {
        var e = elements[i];
        if (getClassIndex(e, className) < 0) return false;
      }

      return true;
    }

    return hasClass;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/addClass',[
    'ui/hasClass',
    'ui/toElementArray',
    'utils/assert',
    'utils/sizeOf'
  ],
  function(
    hasClass,
    toElementArray,
    assert,
    sizeOf
  ) {
    /**
     * Adds a class(es) to DOM element(s).
     *
     * @param  {Object/Array} element   HTMLElement, VARS Element, or jQuery object.
     * @param  {String/Array} className
     */
    function addClass(element, className) {
      var elements = toElementArray(element);
      var classes = [];
      var n = sizeOf(elements);

      if (!assert((typeof className === 'string') || (className instanceof Array), 'Invalid class name specified. Must be either a string or an array of strings.')) return;

      if (typeof className === 'string') {
        classes.push(className);
      }
      else {
        classes = className;
      }

      var nClasses = sizeOf(classes);

      for (var i = 0; i < n; i++) {
        var e = elements[i];

        for (var j = 0; j < nClasses; j++) {
          var c = classes[j];

          if (!assert(typeof c === 'string', 'Invalid class detected: ' + c)) continue;
          if (hasClass(e, c)) continue;

          e.className = e.className + ((e.className === '') ? '' : ' ') + c;
        }
      }
    }

    return addClass;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/getElementState',[
    'ui/Directives',
    'ui/Element',
    'utils/assert',
    'utils/sizeOf'
  ],
  function(
    Directives,
    Element,
    assert,
    sizeOf
  ) {
    /**
     * Gets the state of a DOM element, assumes that state classes are prefixed with 'state-'.
     *
     * @param  {Object} element HTMLElement, VARS Element, or jQuery object.
     *
     * @return {String} State of the given element ('state-' prefix is omitted).
     */
    function getElementState(element) {
      if (!assert((element) && ((element instanceof HTMLElement) || (element instanceof Element) || (element.jquery)), 'Invalid element specified.')) return null;

      if (element.jquery) element = element.get(0);

      var s;

      if (element instanceof Element) {
        s = element.state;
      }
      else {
        s = element.getAttribute(Directives.State) || element.getAttribute('data-' + Directives.State);
      }

      if (!s || s === '') {
        return null;
      }
      else {
        return s;
      }
    }

    return getElementState;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/changeElementState',[
    'ui/Directives',
    'ui/getElementState',
    'ui/toElementArray',
    'ui/Element',
    'utils/assert',
    'utils/sizeOf'
  ],
  function(
    Directives,
    getElementState,
    toElementArray,
    Element,
    assert,
    sizeOf
  ) {
    /**
     * Changes the state of DOM element(s), assumes that state classes are prefixed
     * with 'state-'.
     *
     * @param  {Object/Array} element   HTMLElement, VARS Element, or jQuery object.
     * @param  {String}       state
     */
    function changeElementState(element, state) {
      var elements = toElementArray(element, true);
      var n = sizeOf(elements);

      for (var i = 0; i < n; i++) {
        var e = elements[i];

        if (getElementState(e) === state) continue;

        if (e instanceof Element) {
          e.state = state;
        }
        else {
          e.setAttribute('data-' + Directives.State, state);
        }
      }
    }

    return changeElementState;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('utils/inherit',[],
  function() {

    /**
     * Sets up prototypal inheritance between a child class and a parent class. This process
     * also creates a new prototype method hasProperty() for the child class which allows
     * verifying inherited properties (as opposed to the native hasOwnProperty() method).
     *
     * @param  {Object} child   Child class (function)
     * @param  {Object} parent  Parent class (function)
     *
     * @return {Object} Parent class (function).
     */
    function inherit(child, parent) {
      for (var key in parent) {
        if (parent.hasOwnProperty(key)) {
          child[key] = parent[key];
        }
      }

      function c() {
        this.constructor = child;
      }

      c.prototype = Object.create(parent.prototype);
      child.prototype = new c();
      child.__super__ = parent.prototype;
      return child;
    }

    return inherit;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Controller of a DOM 'video' element.
 *
 * @type {Class}
 */
define('ui/Video',[
    'utils/assert',
    'utils/log',
    'utils/inherit',
    'enums/DirtyType',
    'ui/Element'
  ],
  function(
    assert,
    log,
    inherit,
    DirtyType,
    Element
  ) {
    inherit(Video, Element);

    /**
     * @constructor
     *
     * Creates a new Video instance.
     */
    function Video() {
      Video.__super__.constructor.apply(this, arguments);
    }

    /**
     * @static
     *
     * Constants for the 'preload' attribute.
     *
     * @type {Object}
     *
     * @see  http://www.w3schools.com/tags/tag_video.asp
     */
    Video.PRELOAD = {
      AUTO: 'auto',
      METADATA: 'metada',
      NONE: 'none'
    };

    /**
     * @inheritDoc
     */
    Video.prototype.update = function() {
      if (this.updateDelegate.isDirty(DirtyType.DATA)) {
        this._updateSource();
      }

      if (this.updateDelegate.isDirty(DirtyType.CUSTOM)) {

      }

      Video.__super__.update.call(this);
    };

    /**
     * @inheritDoc
     */
    Video.prototype.factory = function() {
      return document.createElement('video');
    };

    /**
     * @private
     *
     * Updates the sources in this Video instance.
     */
    Video.prototype._updateSource = function() {
      var i;
      var arrlen;

      // Update source(s).
      var oldSources = this.element.getElementsByTagName('source');

      arrlen = oldSources.length;

      for (i = 0; i < arrlen; i++) {
        var oldSource = oldSources[i];

        this.element.removeChild(oldSource);
      }

      if (!this.source) return;

      arrlen = this.source.length;

      for (i = 0; i < arrlen; i++) {
        var newSource = document.createElement('source');
        var path = this.source[i].src;
        var type = this.source[i].type;
        var ext = path.split('.').pop();

        newSource.setAttribute('src', path);
        newSource.setAttribute('type', type || 'video/' + ext);

        this.element.appendChild(newSource);
      }
    };

    /**
     * @inheritDoc
     */
    Video.prototype.toString = function() {
      return '[Video{' + this.name + '}]';
    };

    /**
     * @inheritDoc
     */
    Video.prototype.__define_properties = function() {
      /**
       * @property
       *
       * Specifies that the video will start playing as soon as it is ready.
       *
       * @type {Boolean}
       */
      Object.defineProperty(this, 'autoplay', {
        get: function() {
          return this.element.autoplay;
        },
        set: function(value) {
          this.element.autoplay = value;
          this.updateDelegate.setDirty(DirtyType.CUSTOM);
        }
      });

      /**
       * @property
       *
       * Specifies that video controls should be displayed (such as a play/pause button etc).
       *
       * @type {Boolean}
       */
      Object.defineProperty(this, 'controls', {
        get: function() {
          return this.element.controls;
        },
        set: function(value) {
          this.element.controls = value;
          this.updateDelegate.setDirty(DirtyType.CUSTOM);
        }
      });

      /**
       * @property
       *
       * Specifies that the video will start over again, every time it is finished.
       *
       * @type {Boolean}
       */
      Object.defineProperty(this, 'loop', {
        get: function() {
          return this.element.loop;
        },
        set: function(value) {
          this.element.loop = value;
          this.updateDelegate.setDirty(DirtyType.CUSTOM);
        }
      });

      /**
       * @property
       *
       * Specifies that the audio output of the video should be muted.
       *
       * @type {Boolean}
       */
      Object.defineProperty(this, 'muted', {
        get: function() {
          return this.element.muted;
        },
        set: function(value) {
          this.element.muted = value;
          this.updateDelegate.setDirty(DirtyType.CUSTOM);
        }
      });

      /**
       * @property
       *
       * Specifies an image to be shown while the video is downloading, or until the user hits the play button.
       *
       * @type {String}   URL of image
       */
      Object.defineProperty(this, 'poster', {
        get: function() {
          return this.element.poster;
        },
        set: function(value) {
          this.element.poster = value;
          this.updateDelegate.setDirty(DirtyType.CUSTOM);
        }
      });

      /**
       * @property
       *
       * Specifies if and how the author thinks the video should be loaded when the page loads
       *
       * @type {String}   See Video.AUTOPLAY
       */
      Object.defineProperty(this, 'preload', {
        get: function() {
          return this.element.preload;
        },
        set: function(value) {
          this.element.preload = value;
          this.updateDelegate.setDirty(DirtyType.CUSTOM);
        }
      });

      /**
       * @property
       *
       * Array of sources containing elements in the form of:
       *     Object
       *     {
       *         src: {PATH_OF_SOURCE} (String)
       *         type: {TYPE_OF_SOURCE} (String)
       *     }
       *
       * @type {Array}
       */
      Object.defineProperty(this, 'source', {
        get: function() {
          return this._source;
        },
        set: function(value) {
          Object.defineProperty(this, '_source', {
            value: value,
            writable: true
          });
          this.updateDelegate.setDirty(DirtyType.DATA);
        }
      });

      Video.__super__.__define_properties.call(this);
    };

    /**
     * @inheritDoc
     */
    Video.prototype.__set_element = function(value) {
      assert(value instanceof HTMLVideoElement, 'Invalid element type specified. Must be an instance of HTMLVideoElement.');
      Video.__super__.__set_element.call(this, value);
    };

    return Video;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('utils/namespace',[
    'utils/assert'
  ],
  function(
    assert
  ) {
    /**
     * Creates the specified namespace in the specified scope.
     *
     * @param  {String} identifiers Namespace identifiers with parts separated by dots.
     * @param  {Object} scope       (Optional) Object to create namespace in (defaults to window).
     *
     * @return {Object} Reference tothe created namespace.
     */
    function namespace(identifiers, scope) {
      if (!assert(typeof identifiers === 'string', 'Invalid identifiers specified.')) return null;
      if (!assert(typeof scope === 'undefined' || typeof scope === 'object', 'Invalid scope specified.')) return null;

      var groups = identifiers.split('.');
      var currentScope = (scope === undefined || scope === null) ? window : scope;

      for (var i = 0; i < groups.length; i++) {
        currentScope = currentScope[groups[i]] || (currentScope[groups[i]] = {});
      }

      return currentScope;
    }

    return namespace;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('utils/ready',[],
  function() {
    /**
     * Invokes a function when the DOM is ready.
     *
     * @param  {Function}   callback    Function invoked when the DOM is ready.
     */
    function ready(callback) {
      if (!document) return null;

      var onLoaded = function(event) {
        if (document.addEventListener) {
          document.removeEventListener('DOMContentLoaded', onLoaded, false);
          window.removeEventListener('load', onLoaded, false);
        }
        else if (document.attachEvent) {
          document.detachEvent('onreadystatechange', onLoaded);
          window.detachEvent('onload', onLoaded);
        }

        setTimeout(callback, 1);
      };

      if (document.readyState === 'complete') {
        return setTimeout(callback, 1);
      }

      if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', onLoaded, false);
        window.addEventListener('load', onLoaded, false);
      }
      else if (document.attachEvent) {
        document.attachEvent('onreadystatechange', onLoaded);
        window.attachEvent('onload', onLoaded);
      }

      return null;
    }

    return ready;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/getChildElements',[
    'ui/Directives',
    'ui/Element',
    'ui/Video',
    'utils/assert',
    'utils/namespace',
    'utils/ready',
    'utils/sizeOf'
  ],
  function(
    Directives,
    Element,
    Video,
    assert,
    namespace,
    ready,
    sizeOf
  ) {
    /**
     * Transforms all the DOM elements inside the specified element marked with custom
     * VARS attributes into an instance of either its specified controller class or a generic
     * VARS Element. If a marked DOM element is a child of another marked DOM element, it will
     * be passed into the parent element's children tree as its specified controller
     * class instance or a generic VARS Element.
     *
     * @param  {Object} element         HTMLElement, VARS Element, or jQuery object.
     * @param  {Object} controllerScope
     */
    function getChildElements(element, controllerScope) {
      var children = null;

      if (!element) element = document;
      if (element.jquery) element = element.get(0);
      if (!assert((element instanceof HTMLElement) || (element instanceof Element) || (document && element === document), 'Element must be an instance of an HTMLElement or the DOM itself.')) return null;
      if (element instanceof Element) element = element.element;

      var qualifiedChildren = element.querySelectorAll('[' + Directives.Controller + '], [data-' + Directives.Controller + '], [' + Directives.Instance + '], [data-' + Directives.Instance + ']');
      var n = sizeOf(qualifiedChildren);

      for (var i = 0; i < n; i++) {
        var child = qualifiedChildren[i];
        var className = child.getAttribute(Directives.Controller) || child.getAttribute('data-' + Directives.Controller);
        var childName = child.getAttribute(Directives.Instance) || child.getAttribute('data-' + Directives.Instance);
        var controller = (className) ? namespace(className, controllerScope) : null;

        // If no controller class is specified but element is marked as an  instance, default the controller class to
        // Element.
        if (!controller && sizeOf(childName) > 0) {
          controller = Element;
        }
        else if (typeof controller !== 'function') {
          switch (className) {
            case 'Video': {
              controller = Video;
              break;
            }
            case 'Element': {
              controller = Element;
              break;
            }
            default: {
              controller = null;
              break;
            }
          }
        }

        // Check if discovered child is also an immediate child of another discovered
        // child.
        var ignore = false;

        for (var j = 0; j < n; j++) {
          if (j === i) continue;

          var parent = qualifiedChildren[j];

          if (parent.contains && parent.contains(child)) {
            ignore = true;
            break;
          }
        }

        if (ignore) continue;

        if (!assert(typeof controller === 'function', 'Class "' + className + '" is not found in specified controllerScope ' + (controllerScope || window) + '.')) continue;

        var m = new controller({
          element: child,
          name: childName,
          children: getChildElements(child, controllerScope)
        });

        if (sizeOf(childName) > 0) {
          if (!children) children = {};

          if (!children[childName]) {
            children[childName] = m;
          }
          else {
            if (children[childName] instanceof Array) {
              children[childName].push(m);
            }
            else {
              var a = [children[childName]];
              a.push(m);
              children[childName] = a;
            }
          }
        }
      }

      return children;
    }

    return getChildElements;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/getViewportRect',[
    'utils/assert'
  ],
  function(
    assert
  ) {
    /**
     * Gets the rect of the viewport (FOV).
     *
     * @return {Object} Object containing top, left, bottom, right, width, height.
     */
    function getViewportRect() {
      if (!assert(window && document, 'Window or document undefined.')) return null;

      var rect = {};

      rect.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      rect.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      rect.top = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
      rect.left = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
      rect.bottom = rect.top + rect.height;
      rect.right = rect.left + rect.width;

      return rect;
    }

    return getViewportRect;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/getRect',[
    'ui/getViewportRect',
    'ui/toElementArray',
    'ui/Element',
    'utils/assert',
    'utils/sizeOf'
  ],
  function(
    getViewportRect,
    toElementArray,
    Element,
    assert,
    sizeOf
  ) {
    /**
     * Gets the rect of a given element or the overall rect of an array of elements.
     *
     * @param  {Object/Array} element   HTMLElement, VARS Element, or jQuery object.
     * @param  {Object}       reference The reference FOV, defaults to window.
     *
     * @return {Object} Object containing top, left, bottom, right, width, height.
     */
    function getRect(element, reference) {
      if (!assert(window, 'This method relies on the window object, which is undefined.')) return null;
      if (element === window) return getViewportRect();

      if (!reference) reference = window;

      var elements = toElementArray(element);
      var n = sizeOf(elements);

      if (n <= 0) return null;

      var refRect = getRect(reference);

      if (!assert(refRect, 'Cannot determine reference FOV.')) return null;

      var winRect = getRect(window);
      var rect = {};

      for (var i = 0; i < n; i++) {
        var e = elements[i];
        var c = e.getBoundingClientRect();

        var w = c.width;
        var h = c.height;
        var t = c.top + winRect.top;
        if (reference !== window) t -= refRect.top;
        var l = c.left + winRect.left;
        if (reference !== window) l -= refRect.left;
        var b = t + h;
        var r = l + w;

        if (rect.left === undefined) {
          rect.left = l;
        }
        else {
          rect.left = Math.min(rect.left, l);
        }

        if (rect.right === undefined) {
          rect.right = r;
        }
        else {
          rect.right = Math.max(rect.right, r);
        }

        if (rect.top === undefined) {
          rect.top = t;
        }
        else {
          rect.top = Math.min(rect.top, t);
        }

        if (rect.bottom === undefined) {
          rect.bottom = b;
        }
        else {
          rect.bottom = Math.max(rect.bottom, b);
        }
      }

      rect.width = rect.right - rect.left;
      rect.height = rect.bottom - rect.top;

      return rect;
    }

    return getRect;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/getIntersectRect',[
    'ui/getRect',
    'ui/Element',
    'utils/assert',
    'utils/sizeOf'
  ],
  function(
    getRect,
    Element,
    assert,
    sizeOf
  ) {
    /**
     * Computes the intersecting rect of 2 given elements. If only 1 element is specified, the other
     * element will default to the current viewport.
     *
     * @param  {Object/Array} arguments HTMLElement, VARS Element, or jQuery object.
     *
     * @return {Object} Object containing width, height.
     */
    function getIntersectRect() {
      if (!assert(window, 'This method relies on the window object, which is undefined.')) return null;

      var n = sizeOf(arguments);

      if (!assert(n > 0, 'This method requires at least 1 argument specified.')) return null;

      var rect = {};
      var currRect, nextRect;

      for (var i = 0; i < n; i++) {
        if (!currRect) currRect = getRect(arguments[i]);

        if (!assert(currRect, 'Invalid computed rect.')) return null;

        if (i === 0 && ((i + 1) === n)) {
          nextRect = getRect(window);
        }
        else if ((i + 1) < n) {
          nextRect = getRect(arguments[i + 1]);
        }
        else {
          break;
        }

        if (!assert(nextRect, 'Invalid computed rect.')) return null;

        rect.width = Math.max(0.0, Math.min(currRect.right, nextRect.right) - Math.max(currRect.left, nextRect.left));
        rect.height = Math.max(0.0, Math.min(currRect.bottom, nextRect.bottom) - Math.max(currRect.top, nextRect.top));
        rect.top = Math.max(currRect.top, nextRect.top);
        rect.left = Math.max(currRect.left, nextRect.left);
        rect.bottom = rect.top + rect.height;
        rect.right = rect.left + rect.width;

        if (rect.width * rect.height === 0) {
          rect.width = 0;
          rect.height = 0;
          rect.top = 0;
          rect.left = 0;
          rect.bottom = 0;
          rect.right = 0;
        }

        currRect = rect;
      }

      return rect;
    }

    return getIntersectRect;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/hasChild',[
    'ui/toElementArray',
    'utils/assert',
    'utils/sizeOf'
  ],
  function(
    toElementArray,
    assert,
    sizeOf
  ) {
    /**
     * Checks if specified parent contains specified child.
     *
     * @param  {Object} parent  HTMLElement, VARS Element, or jQuery object.
     * @param  {Object} child   HTMLElement, VARS Element, or jQuery object.
     *
     * @return {Boolean} True if parent has given child, false otherwise.
     */
    function hasChild(parent, child) {
      var ps = toElementArray(parent);
      var cs = toElementArray(child);

      if (!assert(sizeOf(ps) === 1, 'Invalid parent specified. Parent must be a single HTMLElement, VARS Element, or jQuery object.')) return false;
      if (!assert(sizeOf(cs) === 1, 'Invalid child specified. Child must be a single HTMLElement, VARS Element, or jQuery object.')) return false;
      if (!assert(document, 'Document not found. This method requires document to be valid.')) return false;

      var p = ps[0];
      var c = cs[0];

      if (!c.parentNode) return false;

      while (c !== null && c !== undefined && c !== document) {
        c = c.parentNode;

        if (c === p) return true;
      }

      return false;
    }

    return hasChild;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/hitTestElement',[
    'math/isClamped',
    'ui/getIntersectRect',
    'ui/getRect',
    'ui/toElementArray',
    'utils/assert',
    'utils/sizeOf'
  ],
  function(
    isClamped,
    getIntersectRect,
    getRect,
    toElementArray,
    assert,
    sizeOf
  ) {
    /**
     * Hit tests a vector or element against other elements.
     *
     * @param  {Object/Array} Vector ({ x, y }), HTMLElement, VARS Element, or jQuery object.
     * @param  {Object/Array} HTMLElement, VARS Element, or jQuery object.
     *
     * @return {Boolean} True if test passes, false otherwise.
     */
    function hitTestElement() {
      if (!assert(sizeOf(arguments) > 1, 'Insufficient arguments. Expecting at least 2.')) return false;

      var args = Array.prototype.slice.call(arguments);
      var isVector = (typeof args[0] === 'object') && args[0].hasOwnProperty('x') && args[0].hasOwnProperty('y');

      if (isVector) {
        var vector = args.shift();
        var n = sizeOf(args);
        var pass = false;

        for (var i = 0; i < n; i++) {
          var rect = getRect(args[i]);

          if (isClamped(vector.x, rect.left, rect.right) && isClamped(vector.y, rect.top, rect.bottom)) {
            pass = true;
          }
        }

        return pass;
      }
      else {
        var intersectRect = getIntersectRect.apply(null, arguments);

        if (!assert(intersectRect, 'Invalid elements specified.')) return false;

        return (intersectRect.width * intersectRect.height !== 0);
      }
    }

    return hitTestElement;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/hitTestRect',[
    'math/isClamped',
    'ui/getIntersectRect',
    'ui/getRect',
    'ui/toElementArray',
    'utils/assert',
    'utils/sizeOf'
  ],
  function(
    isClamped,
    getIntersectRect,
    getRect,
    toElementArray,
    assert,
    sizeOf
  ) {
    /**
     * Hit tests a vector or element against other elements.
     *
     * @param  {Object/Array} Vector ({ x, y }), HTMLElement, VARS Element, or jQuery object.
     * @param  {Object/Array} HTMLElement, VARS Element, or jQuery object.
     *
     * @return {Boolean} True if test passes, false otherwise.
     */
    function hitTestRect() {
      if (!assert(sizeOf(arguments) > 1, 'Insufficient arguments. Expecting at least 2.')) return false;

      var args = Array.prototype.slice.call(arguments);
      var isVector = (typeof args[0] === 'object') && args[0].hasOwnProperty('x') && args[0].hasOwnProperty('y');

      if (isVector) {
        var vector = args.shift();
        var n = sizeOf(args);
        var pass = false;

        for (var i = 0; i < n; i++) {
          var rect = args[i];
          if (!assert(rect.top !== undefined && !isNaN(rect.top) && rect.right !== undefined && !isNaN(rect.right) && rect.bottom !== undefined && !isNaN(rect.bottom) && rect.left !== undefined && !isNaN(rect.left), 'Invalid rect supplied. Rect must be an object containing "top", "right", "bottom", and "left" key values.')) return false;

          if (isClamped(vector.x, rect.left, rect.right) && isClamped(vector.y, rect.top, rect.bottom)) {
            pass = true;
          }
        }

        return pass;
      }
      else {
        var intersectRect = getIntersectRect.apply(null, arguments);

        if (!assert(intersectRect, 'Invalid elements specified.')) return false;

        return (intersectRect.width * intersectRect.height !== 0);
      }
    }

    return hitTestRect;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/initDOM',[
    'ui/getChildElements',
    'utils/ready'
  ],
  function(
    getChildElements,
    ready
  ) {
    /**
     * Parses the entire DOM and transforms elements marked with VARS attributes
     * into instances of its corresponding controller class (or VARS Element by
     * by default).
     *
     * @param  {Object} controllerScope
     */
    function initDOM(controllerScope) {
      ready(function() {
        getChildElements(document, controllerScope);
      });
    }

    return initDOM;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/removeClass',[
    'ui/toElementArray',
    'utils/assert',
    'utils/sizeOf'
  ],
  function(
    toElementArray,
    assert,
    sizeOf
  ) {
    /**
     * Removes a class(es) from DOM element(s).
     *
     * @param  {Object/Array} element   HTMLElement, VARS Element, or jQuery object.
     * @param  {String/Array} className
     */
    function removeClass(element, className) {
      var elements = toElementArray(element);
      var classes = [];
      var n = sizeOf(elements);

      if (!assert((typeof className === 'string') || (className instanceof Array), 'Invalid class name specified. Must be either a string or an array of strings.')) return;

      if (typeof className === 'string') {
        classes.push(className);
      }
      else {
        classes = className;
      }

      var nClasses = sizeOf(classes);

      for (var i = 0; i < n; i++) {
        var e = elements[i];

        for (var j = 0; j < nClasses; j++) {
          var c = classes[j];

          if (!assert(typeof c === 'string', 'Invalid class detected: ' + c)) continue;

          var regex = new RegExp('^' + c + '\\s+|\\s+' + c, 'g');
          e.className = e.className.replace(regex, '');
        }
      }
    }

    return removeClass;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/transform',[
    'ui/toElementArray',
    'utils/assert',
    'utils/sizeOf'
  ],
  function(
    toElementArray,
    assert,
    sizeOf
  ) {
    /**
     * Transforms a DOM element.
     *
     * @param  {Object/Array} element   HTMLElement, VARS Element, or jQuery object.
     * @param  {Object} properties      Transformation properties:
     *                                  {
     *                                  	{Number} width:  Target width of the element
     *                                   	{Number} height: Target height of the element
     *                                    	{String} unit:   Unit of width/height values
     *                                     {String} type:   Resizing constraint: 'default', 'contain', 'cover'
     *                                  }
     *                                  (if unspecified, all transformation styles will be reset to 'initial')
     * @param  {Object} constraints     Transformation constraints:
     *                                  {
     *                                  	{Number} width:  Bounded width of the element.
     *                                   	{Number} height: Bounded height of the element.
     *                                  }
     *
     * @return {Object} Transformed properties.
     */
    function transform(element, properties, constraints) {
      var elements = toElementArray(element);
      var n = sizeOf(elements);

      if (properties) {
        if (!assert((properties.width === undefined) || !isNaN(properties.width), 'Width property must be a number.')) return null;
        if (!assert((properties.height === undefined) || !isNaN(properties.height), 'Height property must be a number.')) return null;
        if (!assert((properties.aspectRatio === undefined) || !isNaN(properties.aspectRatio), 'Aspect ratio property must be a number.')) return null;

        var units = properties.units || 'px';
        var aspectRatio = (properties.aspectRatio !== undefined) ? Number(properties.aspectRatio) : properties.width / properties.height;
        var maxW = properties.width;
        var maxH = properties.height;
        var minW = properties.width;
        var minH = properties.height;
        var type = properties.type || 'default';

        if (constraints && type !== 'default') {
          assert((constraints.width === undefined) || !isNaN(constraints.width), 'Width constraint must be a number.');
          assert((constraints.height === undefined) || !isNaN(constraints.height), 'Height constraint must be a number.');

          if (type && type === 'cover') {
            if (constraints.width !== undefined) minW = Math.min(constraints.width, minW);
            if (constraints.width !== undefined) minH = Math.min(constraints.height, minH);
          }
          else {
            if (constraints.width !== undefined) maxW = Math.min(constraints.width, maxW);
            if (constraints.height !== undefined) maxH = Math.min(constraints.height, maxH);
          }
        }

        var w, h;

        if (type === 'contain') {
          w = (maxW > maxH) ? maxH * aspectRatio : maxW;
          h = (maxW > maxH) ? maxH : maxW / aspectRatio;

          if (w > maxW) {
            w = maxW;
            h = w / aspectRatio;
          }
          else if (h > maxH) {
            h = maxH;
            w = h * aspectRatio;
          }
        }
        else if (type == 'cover') {
          w = (minW > minH) ? minH * aspectRatio : minW;
          h = (minW > minH) ? minH : minW / aspectRatio;

          if (w < minW) {
            w = minW;
            h = w / aspectRatio;
          }
          else if (h < minH) {
            h = minH;
            w = h * aspectRatio;
          }
        }
        else {
          w = maxW;
          h = maxH;
        }

        for (var i = 0; i < n; i++) {
          var e = elements[i];

          if (properties.width !== undefined) e.style.width = String(w) + units;
          if (properties.height !== undefined) e.style.height = String(h) + units;
        }

        var t = {};

        if (properties.width !== undefined) t.width = w;
        if (properties.height !== undefined) t.height = h;

        return t;
      }
      else {
        for (var j = 0; j < n; j++) {
          elements[j].style.width = 'initial';
          elements[j].style.height = 'initial';
        }

        return {
          width: 'initial',
          height: 'initial'
        };
      }
    }

    return transform;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/translate',[
    'ui/toElementArray',
    'utils/assert',
    'utils/sizeOf'
  ],
  function(
    toElementArray,
    assert,
    sizeOf
  ) {
    /**
     * Translates a DOM element.
     *
     * @param  {Object/Array} element   HTMLElement, VARS Element, or jQuery object.
     * @param  {Object} properties      Translation properties:
     *                                  {
     *                                      {Number} top:    Top translation value
     *                                      {Number} right:  Right translation value
     *                                      {Number} bottom: Bottom translation value
     *                                      {Number} left:   Left translation value
     *                                      {String} units:  Unit of translation values
     *                                  }
     *                                  (if unspecified, all translation values will be reset to 'initial')
     * @param  {Object} constraints     Translation constraints:
     *                                  {
     *                                      {Number} top:    Bounded top translation value
     *                                      {Number} right:  Bounded right translation value
     *                                      {Number} bottom: Bounded bottom translation value
     *                                      {Number} left:   Bounded left translation value
     *                                  }
     *
     * @return {Object} Translated properties.
     */
    function translate(element, properties, constraints) {
      var elements = toElementArray(element);
      var n = sizeOf(elements);

      if (properties) {
        if (!assert((properties.top === undefined) || !isNaN(properties.top), 'Top property must be a number.')) return null;
        if (!assert((properties.right === undefined) || !isNaN(properties.right), 'Right property must be a number.')) return null;
        if (!assert((properties.bottom === undefined) || !isNaN(properties.bottom), 'Bottom property must be a number.')) return null;
        if (!assert((properties.left === undefined) || !isNaN(properties.left), 'Left property must be a number.')) return null;

        var units = properties.units || 'px';

        if (constraints) {
          if (!assert((constraints.top === undefined) || !isNaN(constraints.top), 'Top constraint must be a number.')) return null;
          if (!assert((constraints.right === undefined) || !isNaN(constraints.right), 'Right constraint must be a number.')) return null;
          if (!assert((constraints.bottom === undefined) || !isNaN(constraints.bottom), 'Bottom constraint must be a number.')) return null;
          if (!assert((constraints.left === undefined) || !isNaN(constraints.left), 'Left constraint must be a number.')) return null;
        }

        var top = (constraints && (constraints.top !== undefined)) ? Math.min(properties.top, constraints.top) : properties.top;
        var right = (constraints && (constraints.right !== undefined)) ? Math.min(properties.right, constraints.right) : properties.right;
        var bottom = (constraints && (constraints.bottom !== undefined)) ? Math.min(properties.bottom, constraints.bottom) : properties.bottom;
        var left = (constraints && (constraints.left !== undefined)) ? Math.min(properties.left, constraints.left) : properties.left;

        for (var i = 0; i < n; i++) {
          if (properties.top !== undefined) elements[i].style.top = String(top) + units;
          if (properties.right !== undefined) elements[i].style.right = String(right) + units;
          if (properties.bottom !== undefined) elements[i].style.bottom = String(bottom) + units;
          if (properties.left !== undefined) elements[i].style.left = String(left) + units;
        }

        var t = {};

        if (properties.top !== undefined) t.top = top;
        if (properties.right !== undefined) t.right = right;
        if (properties.bottom !== undefined) t.bottom = bottom;
        if (properties.left !== undefined) t.left = left;

        return t;
      }
      else {
        for (var j = 0; j < n; j++) {
          elements[j].style.top = 'initial';
          elements[j].style.right = 'initial';
          elements[j].style.bottom = 'initial';
          elements[j].style.left = 'initial';
        }

        return {
          top: 'initial',
          right: 'initial',
          bottom: 'initial',
          left: 'initial'
        };
      }
    }

    return translate;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('ui/translate3d',[
    'ui/toElementArray',
    'utils/assert',
    'utils/sizeOf'
  ],
  function(
    toElementArray,
    assert,
    sizeOf
  ) {
    /**
     * Translates a DOM element.
     *
     * @param  {Object/Array} element   HTMLElement, VARS Element, or jQuery object.
     * @param  {Object} properties      Translation properties: x/y/z/units
     *                                  {
     *                                  	{Number} x:     X-coordinate
     *                                   	{Number} y:     Y-coordinate
     *                                    	{Number} z:     Z-coordinate
     *                                     	{String} units: Unit of translation values
     *                                  }
     *                                  (if unspecified, all translation coordinates will be reset to 0)
     * @param  {Object} constraints     Translation constraints:
     *                                  {
     *                                  	{Number} x:     Bounded x-coordinate
     *                                   	{Number} y:     Bounded y-coordinate
     *                                    	{Number} z:     Bounded z-coordinate
     *                                  }
     *
     * @return {Object} Translated properties.
     */
    function translate3d(element, properties, constraints) {
      var elements = toElementArray(element);
      var n = sizeOf(elements);

      if (properties) {
        if (!assert(properties.x === undefined || !isNaN(properties.x), 'X property must be a number.')) return null;
        if (!assert(properties.y === undefined || !isNaN(properties.y), 'Y property must be a number.')) return null;
        if (!assert(properties.z === undefined || !isNaN(properties.z), 'Z property must be a number.')) return null;

        var units = properties.units || 'px';

        if (constraints) {
          if (!assert(constraints.x === undefined || !isNaN(constraints.x), 'X constraint must be a number.')) return null;
          if (!assert(constraints.y === undefined || !isNaN(constraints.y), 'Y constraint must be a number.')) return null;
          if (!assert(constraints.z === undefined || !isNaN(constraints.z), 'Z constraint must be a number.')) return null;
        }

        var x = (constraints && (constraints.x !== undefined)) ? Math.min(properties.x, constraints.x) : properties.x;
        var y = (constraints && (constraints.y !== undefined)) ? Math.min(properties.y, constraints.y) : properties.y;
        var z = (constraints && (constraints.z !== undefined)) ? Math.min(properties.z, constraints.z) : properties.z;

        var translateX = (properties.x !== undefined) ? 'translateX(' + x + units + ')' : null;
        var translateY = (properties.y !== undefined) ? 'translateY(' + y + units + ')' : null;
        var translateZ = (properties.z !== undefined) ? 'translateZ(' + z + units + ')' : null;
        var transforms = '';

        if (translateX) transforms += (transforms === '') ? translateX : ' ' + translateX;
        if (translateY) transforms += (transforms === '') ? translateY : ' ' + translateY;
        if (translateZ) transforms += (transforms === '') ? translateZ : ' ' + translateZ;

        for (var i = 0; i < n; i++) {
          elements[i].style.transform = transforms;
        }

        var t = {};

        if (translateX) t.x = x;
        if (translateY) t.y = y;
        if (translateZ) t.z = z;

        return t;
      }
      else {
        for (var j = 0; j < n; j++) {
          elements[j].style.transform = 'translateX(0) translateY(0) translateZ(0)';
        }

        return {
          x: 0,
          y: 0,
          z: 0
        };
      }
    }

    return translate3d;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Module of methods/classes related to UI manipulation and
 * operations.
 *
 * @type {Module}
 */
define('ui',[
    'ui/addClass',
    'ui/changeElementState',
    'ui/getClassIndex',
    'ui/getChildElements',
    'ui/getElementState',
    'ui/getIntersectRect',
    'ui/getRect',
    'ui/getViewportRect',
    'ui/hasClass',
    'ui/hasChild',
    'ui/hitTestElement',
    'ui/hitTestRect',
    'ui/initDOM',
    'ui/removeClass',
    'ui/toElementArray',
    'ui/transform',
    'ui/translate',
    'ui/translate3d',
    'ui/Directives',
    'ui/Element',
    'ui/ElementUpdateDelegate',
    'ui/Video'
  ],
  function(
    addClass,
    changeElementState,
    getClassIndex,
    getChildElements,
    getElementState,
    getIntersectRect,
    getRect,
    getViewportRect,
    hasClass,
    hasChild,
    hitTestElement,
    hitTestRect,
    initDOM,
    removeClass,
    toElementArray,
    transform,
    translate,
    translate3d,
    Directives,
    Element,
    ElementUpdateDelegate,
    Video
  ) {
    var api = function(obj) {
      return obj;
    };

    Object.defineProperty(api, 'addClass', { value: addClass, writable: false, enumerable: true });
    Object.defineProperty(api, 'changeElementState', { value: changeElementState, writable: false, enumerable: true });
    Object.defineProperty(api, 'hasClass', { value: hasClass, writable: false, enumerable: true });
    Object.defineProperty(api, 'hasChild', { value: hasChild, writable: false, enumerable: true });
    Object.defineProperty(api, 'getClassIndex', { value: getClassIndex, writable: false, enumerable: true });
    Object.defineProperty(api, 'getChildElements', { value: getChildElements, writable: false, enumerable: true });
    Object.defineProperty(api, 'getElementState', { value: getElementState, writable: false, enumerable: true });
    Object.defineProperty(api, 'getIntersectRect', { value: getIntersectRect, writable: false, enumerable: true });
    Object.defineProperty(api, 'getRect', { value: getRect, writable: false, enumerable: true });
    Object.defineProperty(api, 'getViewportRect', { value: getViewportRect, writable: false, enumerable: true });
    Object.defineProperty(api, 'hitTestElement', { value: hitTestElement, writable: false, enumerable: true });
    Object.defineProperty(api, 'hitTestRect', { value: hitTestRect, writable: false, enumerable: true });
    Object.defineProperty(api, 'initDOM', { value: initDOM, writable: false, enumerable: true });
    Object.defineProperty(api, 'removeClass', { value: removeClass, writable: false, enumerable: true });
    Object.defineProperty(api, 'toElementArray', { value: toElementArray, writable: false, enumerable: true });
    Object.defineProperty(api, 'translate', { value: translate, writable: false, enumerable: true });
    Object.defineProperty(api, 'translate3d', { value: translate3d, writable: false, enumerable: true });
    Object.defineProperty(api, 'transform', { value: transform, writable: false, enumerable: true });
    Object.defineProperty(api, 'Directives', { value: Directives, writable: false, enumerable: true });
    Object.defineProperty(api, 'Element', { value: Element, writable: false, enumerable: true });
    Object.defineProperty(api, 'ElementUpdateDelegate', { value: ElementUpdateDelegate, writable: false, enumerable: true });
    Object.defineProperty(api, 'Video', { value: Video, writable: false, enumerable: true });

    return api;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('utils/isNull',[],
  function() {
    /**
     * Checks if a given object is equal to null (type-insensitive).
     *
     * @param  {Object} object
     *
     * @return {Boolean}
     */
    function isNull(object) {
      if (object === undefined || object === null) {
        return true;
      }
      else {
        return false;
      }
    }

    return isNull;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define('utils/module',[
    'utils/ready'
  ],
  function(
    ready
  ) {
    /**
     * Creates a new module and attaches it to the window when DOM is ready. Option
     * to pass an init object to initialize the module. A typical use-case will be to
     * create a new Element module.
     *
     * @param  {Function}   impl Module implementation.
     * @param  {Object}     init Optional object passed into the impl.
     */
    function module(impl, init) {
      ready(function() {
        return new impl(init);
      });
    }

    return module;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Asset loader for images, videos, and audios.
 *
 * @type {Class}
 */
define('utils/AssetLoader',[
    'utils/assert',
    'utils/log',
    'utils/inherit',
    'events/EventType',
    'events/EventDispatcher'
  ],
  function(
    assert,
    log,
    inherit,
    EventType,
    EventDispatcher
  ) {
    /**
     * @constant
     *
     * Common image file extensions.
     *
     * @type {Array}
     */
    var IMAGE_EXTENSIONS = ['jpg', 'png', 'svg', 'jpeg', 'gif'];

    /**
     * @constant
     *
     * Common video file extensions.
     *
     * @type {Array}
     */
    var VIDEO_EXTENSIONS = ['mp4', 'mpeg', 'ogg', 'ogv', 'mov', 'avi', 'flv'];

    /**
     * @constant
     *
     * Common audio file extensions.
     *
     * @type {Array}
     */
    var AUDIO_EXTENSIONS = ['mp3', 'mp4', 'mpeg', 'flac', 'wav', 'ogg'];

    /**
     * @constant
     *
     * Mime type lookup.
     *
     * @type {Object}
     */
    var MIME_TYPES = {
      IMAGE: {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        png: 'image/png',
        svg: 'image/svg'
      },
      VIDEO: {
        mp4: 'video/mp4',
        mov: 'video/quicktime',
        mpeg: 'video/mpeg',
        ogg: 'video/ogg',
        ogv: 'video/ogg',
        avi: 'video/avi',
        flv: 'video/x-flv'
      },
      AUDIO: {
        mp3: 'audio/mpeg',
        mpeg: 'audio/mpeg',
        mp4: 'audio/mp4',
        flac: 'audio/flac',
        ogg: 'audio/ogg',
        wav: 'audio/vnd.wave'
      }
    };

    /**
     * @constructor
     *
     * Creates a new AssetLoader instance.
     */
    function AssetLoader() {
      AssetLoader.__super__.constructor.apply(this, arguments);
    }
    inherit(AssetLoader, EventDispatcher);

    /**
     * @static
     *
     * Different states of AssetLoader.
     *
     * @type {Enum}
     */
    AssetLoader.STATE = {
      IDLE: 0,
      IN_PROGRESS: 1,
      COMPLETED: 2,
      FAILED: 3,
      ABORTED: 4
    };

    /**
     * @static
     *
     * Different supported asset types of AssetLoader.
     *
     * @type {Object}
     */
    AssetLoader.TYPE = {
      IMAGE: 'image',
      VIDEO: 'video',
      AUDIO: 'audio'
    };

    /**
     * Initializes this AssetLoader instance and begins loading assets in the queue.
     */
    AssetLoader.prototype.init = function() {
      if (this.queue.length < 1) return;

      log('[AssetLoader]::init()');

      var arrlen = this.queue.length;

      this._xhrs = [];
      this._pending = arrlen;

      for (var i = 0; i < arrlen; i++) {
        var target = this.queue[i];

        log('[AssetLoader]::Started loading: ' + target.path);

        var xhr = this.getXHR({
          id: i,
          path: target.path,
          type: target.type
        });
        xhr.send();

        this._xhrs.push(xhr);
      }
    };

    /**
     * Destroys this AssetLoader instance and resets its state to idle for recyclable use.
     */
    AssetLoader.prototype.destroy = function() {
      if (this._xhrs) {
        var arrlen = this._xhrs.length;

        for (var i = 0; i < arrlen; i++) {
          var xhr = this._xhrs[i];
          xhr.abort();
          this._xhrs[i] = null;
        }

        this._queue = null;
        this._assets = null;
        this._bytesLoaded = null;
        this._bytesTotal = null;
      }

      this._state = AssetLoader.STATE.IDLE;
    };

    /**
     * Adds target loading assets to the queue. Assumes each parameter is as follows:
     * Object
     * {
     *     path: {PATH_OF_ASSET},
     *     type: {TYPE_OF_ASSET} (can only be 'image', 'video', or 'audio')
     * }
     */
    AssetLoader.prototype.enqueue = function() {
      assert(arguments && arguments.length > 0, 'There are no arguments specified.');
      assert(this.state !== AssetLoader.STATE.IN_PROGRESS, 'Enqueueing is prohibited when the state is in progress.');

      if (!arguments) return;
      if (arguments.length <= 0) return;
      if (this.state === AssetLoader.STATE.IN_PROGRESS) return;

      log('[AssetLoader]::enqueue(' + arguments + ')');

      var arrlen = arguments.length;

      for (var i = 0; i < arrlen; i++) {
        var arg = arguments[i];

        assert(typeof arg === 'string' || typeof arg === 'object', 'Each item to be enqueued must be a string of the target path or an object containing a "path" key and/or a "type" key');
        assert(typeof arg === 'string' || typeof arg.path === 'string', 'Invalid path specified: ' + arg.path + '.');

        var path = (typeof arg === 'string') ? arg : arg.path;
        var type = arg.type;

        if (!type) {
          var ext = path.split('.').pop().toLowerCase();

          if (IMAGE_EXTENSIONS.indexOf(ext) > -1) {
            type = AssetLoader.TYPE.IMAGE;
          } else if (VIDEO_EXTENSIONS.indexOf(ext) > -1) {
            type = AssetLoader.TYPE.VIDEO;
          } else if (AUDIO_EXTENSIONS.indexOf(ext) > -1) {
            type = AssetLoader.TYPE.AUDIO;
          } else {
            throw '[AssetLoader]::Unsupported asset format: ' + path;
          }
        }

        if (type) {
          this.queue.push({
            path: path,
            type: type
          });

          if (!this._bytesLoaded) this._bytesLoaded = [];
          if (!this._bytesTotal) this._bytesTotal = [];

          this._bytesLoaded.push(0.0);
          this._bytesTotal.push(0.0);
        }
      }
    };

    /**
     * Removes loading targets from the queue. Each parameter is a path that must match one that
     * is already in the queue.
     */
    AssetLoader.prototype.dequeue = function() {
      assert(arguments && arguments.length > 0, 'There are no arguments specified.');
      assert(this.state !== AssetLoader.STATE.IN_PROGRESS, 'Dequeueing is prohibited when the state is in progress.');

      if (!arguments) return;
      if (arguments.length <= 0) return;
      if (this.state === AssetLoader.STATE.IN_PROGRESS) return;

      var arrlen = arguments.length;

      for (var i = 0; i < arrlen; i++) {
        var arg = arguments[i];

        assert(typeof arg === 'string', 'Expecting path to be a string.');

        var n = this.queue.length;

        for (var j = 0; j < n; j++) {
          var target = this.queue[j];

          if (target.path === arg) {
            this.queue.splice(j, 1);
            this.bytesLoaded.splice(j, 1);
            this.bytesTotal.splice(j, 1);

            break;
          }
        }
      }
    };

    /**
     * Creates and returns a new XHR instance with prepopulated configurations.
     *
     * @param  {Object} data
     *
     * @return {Object} XHR instance.
     */
    AssetLoader.prototype.getXHR = function(data) {
      var ext = data.path.split('.').pop().toLowerCase();
      var mimeType = MIME_TYPES[data.type.toUpperCase()][ext];

      if (!mimeType) {
        throw '[AssetLoader]:: Unsupported asset format: ' + data.path;
      }

      var xhr = new XMLHttpRequest();
      xhr.addEventListener('progress', this._onXHRProgress.bind(this), false);
      xhr.addEventListener('load', this._onXHRLoadComplete.bind(this), false);
      xhr.addEventListener('error', this._onXHRLoadError.bind(this), false);
      xhr.addEventListener('abort', this._onXHRAbort.bind(this), false);

      xhr.open('GET', data.path, this.async);
      if (xhr.overrideMimeType) xhr.overrideMimeType(mimeType);
      xhr.data = data;

      return xhr;
    };

    /**
     * @private
     *
     * Handler invoked when an XHR instance is in progress.
     *
     * @param  {Object} event
     */
    AssetLoader.prototype._onXHRProgress = function(event) {
      if (!event.lengthComputable) return;

      var xhr = event.currentTarget;
      var id = xhr.data.id;
      var path = xhr.data.path;
      var type = xhr.data.type;
      var bytesLoaded = event.loaded;
      var bytesTotal = event.total;

      // Hash progress into XHR data.
      xhr.data.bytesLoaded = bytesLoaded;
      xhr.data.bytesTotal = bytesTotal;

      this._bytesLoaded[id] = bytesLoaded;
      this._bytesTotal[id] = bytesTotal;

      if (!this._bytesLoaded) this._bytesLoaded = [];

      log('[AssetLoader]::_onXHRProgress("' + path + '":' + bytesLoaded + '/' + bytesTotal + ')');

      var progressEvent = document.createEvent('CustomEvent');
      progressEvent.initCustomEvent(EventType.OBJECT.PROGRESS, true, true, {
        id: id,
        path: path,
        type: type,
        pending: this._pending,
        loaded: this.bytesLoaded,
        total: this.bytesTotal
      });

      this.dispatchEvent(progressEvent);
    };

    /**
     * @private
     *
     * Handler invoked when an XHR instance completes its operation.
     *
     * @param  {Object} event
     */
    AssetLoader.prototype._onXHRLoadComplete = function(event) {
      var xhr = event.currentTarget;
      var id = xhr.data.id;
      var path = xhr.data.path;
      var type = xhr.data.type;

      log('[AssetLoader]::_onXHRLoadComplete("' + path + '"")');

      this._pending--;

      var loadEvent = document.createEvent('CustomEvent');
      loadEvent.initCustomEvent(EventType.OBJECT.LOAD, true, true, {
        id: id,
        path: path,
        type: type,
        pending: this._pending,
        loaded: this.bytesLoaded,
        total: this.bytesTotal
      });

      this.dispatchEvent(loadEvent);
    };

    /**
     * @private
     *
     * Handler invoked when an XHR instance fails its operation.
     *
     * @param  {Object} event
     */
    AssetLoader.prototype._onXHRLoadError = function(event) {
      var xhr = event.currentTarget;
      var id = xhr.data.id;
      var path = xhr.data.path;
      var type = xhr.data.type;

      log('[AssetLoader]::_onXHRLoadError("' + path + '"")');

      this._pending--;

      var errorEvent = document.createEvent('CustomEvent');
      errorEvent.initCustomEvent(EventType.OBJECT.ERROR, true, true, {
        id: id,
        path: path,
        type: type,
        pending: this._pending,
        loaded: this.bytesLoaded,
        total: this.bytesTotal
      });

      this.dispatchEvent(errorEvent);

      if (this._pending === 0) {
        var loadEvent = document.createEvent('CustomEvent');
        loadEvent.initCustomEvent(EventType.OBJECT.LOAD, true, true, {
          id: id,
          path: path,
          type: type,
          pending: this._pending,
          loaded: this.bytesLoaded,
          total: this.bytesTotal
        });

        this.dispatchEvent(loadEvent);
      }
    };

    /**
     * @private
     *
     * Handler invoked when an XHR aborts its operation.
     *
     * @param  {Object} event
     */
    AssetLoader.prototype._onXHRAbort = function(event) {
      var xhr = event.currentTarget;
      var id = xhr.data.id;
      var path = xhr.data.path;
      var type = xhr.data.type;

      log('[AssetLoader]::_onXHRLoadError("' + path + '"")');

      this._pending--;

      var abortEvent = document.createEvent('CustomEvent');
      abortEvent.initCustomEvent(EventType.OBJECT.ABORT, true, true, {
        id: id,
        path: path,
        type: type,
        pending: this._pending,
        loaded: this.bytesLoaded,
        total: this.bytesTotal
      });

      this.dispatchEvent(abortEvent);

      if (this._pending === 0) {
        var loadEvent = document.createEvent('CustomEvent');
        loadEvent.initCustomEvent(EventType.OBJECT.LOAD, true, true, {
          id: id,
          path: path,
          type: type,
          pending: this._pending,
          loaded: this.bytesLoaded,
          total: this.bytesTotal
        });

        this.dispatchEvent(loadEvent);
      }
    };

    /**
     * @inheritDoc
     */
    AssetLoader.prototype.__define_properties = function() {
      /**
       * @property
       *
       * Specifies the current state of this AssetLoader instance.
       *
       * @type {Number}
       */
      Object.defineProperty(this, 'state', {
        get: function() {
          if (!this._state) {
            Object.defineProperty(this, '_state', {
              value: AssetLoader.STATE.IDLE,
              writable: true
            });
          }

          return this._state;
        }
      });

      /**
       * @property
       *
       * View of this AssetLoader instance.
       *
       * @type {Object}
       */
      Object.defineProperty(this, 'queue', {
        get: function() {
          if (!this._queue) {
            Object.defineProperty(this, '_queue', {
              value: [],
              writable: true
            });
          }

          return this._queue;
        }
      });

      /**
       * @property
       *
       * Loaded assets.
       *
       * @type {Object}
       */
      Object.defineProperty(this, 'assets', {
        get: function() {
          if (!this._assets) {
            Object.defineProperty(this, '_assets', {
              value: {},
              writable: true
            });
          }

          return this._assets;
        }
      });

      /**
       * @property
       *
       * Specifies whether the XHR operations run in async.
       *
       * @type {Boolean}
       */
      Object.defineProperty(this, 'async', {
        get: function() {
          if (this._async === undefined) {
            return true;
          }
          else {
            return this._async;
          }
        },
        set: function(value) {
          assert(this.state !== AssetLoader.STATE.IN_PROGRESS, 'Cannot change the async mode while it is in progress.');

          if (this.state !== AssetLoader.STATE.IN_PROGRESS) {
            Object.defineProperty(this, '_async', {
              value: value,
              writable: true
            });
          }
        }
      });

      /**
       * @property
       *
       * Specifies the total bytes loaded for all assets in the queue.
       *
       * @type {Number}
       */
      Object.defineProperty(this, 'bytesLoaded', {
        get: function() {
          if (!this._bytesLoaded) {
            return 0.0;
          }
          else {
            var total = 0;
            var arrlen = this._bytesLoaded.length;

            for (var i = 0; i < arrlen; i++) {
              total += this._bytesLoaded[i];
            }

            return total;
          }
        }
      });

      /**
       * @property
       *
       * Specifies the total bytes for all assets in the queue.
       *
       * @type {Number}
       */
      Object.defineProperty(this, 'bytesTotal', {
        get: function() {
          if (!this._bytesTotal) {
            return 0.0;
          }
          else {
            var total = 0;
            var arrlen = this._bytesTotal.length;

            for (var i = 0; i < arrlen; i++) {
              total += this._bytesTotal[i];
            }

            return total;
          }
        }
      });

      /**
       * @property
       *
       * Specifies the current progress (in decimals) of the entire operation.
       *
       * @return {Number}
       */
      Object.defineProperty(this, 'progress', {
        get: function() {
          if (!this._bytesTotal || !this._bytesLoaded) return 0.0;
          if (this._bytesTotal.length !== this._bytesLoaded.length) return 0.0;

          var arrlen = this._bytesTotal.length;
          var sum = 0.0;

          for (var i = 0; i < arrlen; i++) {
            var loaded = this._bytesLoaded[i];
            var total = this._bytesTotal[i];

            if (total > 0.0) {
              sum += loaded / total;
            }
          }

          return sum / arrlen;
        }
      });

      AssetLoader.__super__.__define_properties.call(this);
    };

    return AssetLoader;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Module of utility methods/classes.
 *
 * @type {Module}
 */
define('utils',[
    'utils/debounce',
    'utils/inherit',
    'utils/isNull',
    'utils/keyOfValue',
    'utils/module',
    'utils/namespace',
    'utils/ready',
    'utils/sizeOf',
    'utils/AssetLoader'
  ],
  function(
    debounce,
    inherit,
    isNull,
    keyOfValue,
    module,
    namespace,
    ready,
    sizeOf,
    AssetLoader
  ) {
    var api = function(obj) {
      return obj;
    };

    Object.defineProperty(api, 'debounce', { value: debounce, writable: false, enumerable: true });
    Object.defineProperty(api, 'inherit', { value: inherit, writable: false, enumerable: true });
    Object.defineProperty(api, 'isNull', { value: isNull, writable: false, enumerable: true });
    Object.defineProperty(api, 'keyOfValue', { value: keyOfValue, writable: false, enumerable: true });
    Object.defineProperty(api, 'module', { value: module, writable: false, enumerable: true });
    Object.defineProperty(api, 'namespace', { value: namespace, writable: false, enumerable: true });
    Object.defineProperty(api, 'ready', { value: ready, writable: false, enumerable: true });
    Object.defineProperty(api, 'sizeOf', { value: sizeOf, writable: false, enumerable: true });
    Object.defineProperty(api, 'AssetLoader', { value: AssetLoader, writable: false, enumerable: true });


    return api;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Construction of the VARS API.
 */
define(
  'vars',[
    'enums',
    'events',
    'math',
    'ui',
    'utils'
  ],
  function(
    enums,
    events,
    math,
    ui,
    utils
  ) {
    var vars = function(obj) {
      return obj;
    };

    /**
     * Version.
     *
     * @type {String}
     */
    Object.defineProperty(vars, 'version', {
      value: '0.22.0',
      writable: false
    });

    /**
     * Inject the 'enums' module and all of its sub-modules into the main vars module.
     */
    inject('enums', enums);

    /**
     * Inject the 'events' module and all of its sub-modules into the main vars module.
     */
    inject('events', events);

    /**
     * Inject the 'math' module and all of its sub-modules into the main vars module.
     */
    inject('math', math);

    /**
     * Inject the 'ui' module and all of its sub-modules into the main vars module.
     */
    inject('ui', ui);

    /**
     * Inject the 'utils' module and all of its sub-modules into the main vars module.
     */
    inject('utils', utils);

    /**
     * @private
     *
     * Injects a module and all of its sub-modules into the main vars module.
     *
     * @param  {String} name   Name of the module (used as the key for the key-value pair in vars).
     * @param  {Object} module Module object (used as value for the key-value pair in VARS).
     */
    function inject(name, module) {
      Object.defineProperty(vars, name, {
        value: module,
        writable: false
      });

      for (var key in module) {
        if (module.hasOwnProperty(key)) {
          Object.defineProperty(vars, key, {
            value: module[key],
            writable: false
          });
        }
      }
    }

    return vars;
  }
);

/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * End file for r.js.
 */
  return require('vars');
}()));

//# sourceMappingURL=vars.js.map