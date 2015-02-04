/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Start file for r.js.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
(function(root, factory, undefined)
{
    var vars = factory;

    // Check if using AMD.
    if (typeof module !== 'undefined' && module.exports)
    {
        module.exports = vars;
    }
    // Browser (?).
    else
    {
        vars.utils.namespace('io').variante = vars;
        root.vars = vars;
    }
}((typeof window !== 'undefined') ? window : this, function() {/**
 * @license almond 0.3.0 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
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
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

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
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  UI dirty types.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    'enums/dirtytype',{
        NONE:        0x00000000,
        POSITION:    1 << 0,
        SIZE:        1 << 1,
        LAYOUT:      1 << 2,
        STATE:       1 << 3,
        DATA:        1 << 4,
        LOCALE:      1 << 5,
        DEPTH:       1 << 6,
        CONFIG:      1 << 7,
        STYLE:       1 << 8,
        CUSTOM:      1 << 9,
        ALL:         0xFFFFFFFF
    }
);
/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Library enums.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    'enums',[
        'enums/dirtytype'
    ],
    function(dirtytype)
    {
        var api = function(obj)
        {
            return obj;
        };

        api.DirtyType = dirtytype;

        return api;
    }
);
/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Utilities.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    'utils',[

    ],
    function()
    {
        var api = {};

        /**
         * Asserts the specified condition and throws a warning if assertion fails.
         * @param  {bool}   condition   Condition to validate against.
         * @param  {string} message     (Optional) Message to be displayed when assertion fails.
         */
        function assert(condition, message)
        {
            if (!condition && this.debug)
            {
                throw message || '[vars]: Assertion failed.';
            }
        } api.assert = assert;

        /**
         * Logs to console.
         */
        function log()
        {
            if (this.debug && window.console && console.log)
            {
                Function.apply.call(console.log, console, arguments);
            }
        } api.log = log;

        /**
         * Creates the specified namespace in the specified scope.
         * @param  {string} identifiers Namespace identifiers with parts separated by dots.
         * @param  {object} scope       (Optional) Object to create namespace in (defaults to window).
         * @return {object}             Reference tothe created namespace.
         */
        function namespace(identifiers, scope)
        {
            assert(typeof identifiers === 'string', 'Invalid identifiers specified.');
            assert(typeof scope === 'undefined' || typeof scope === 'object', 'Invalid scope specified.');

            var groups = identifiers.split('.');
            var currentScope = (scope === undefined || scope === null) ? window : scope;

            for (var i = 0; i < groups.length; i++)
            {
                currentScope = currentScope[groups[i]] || (currentScope[groups[i]] = {});
            }

            return currentScope;
        } api.namespace = namespace;

        /**
         * Sets up prototypal inheritance between a child class and a parent class.
         * @param  {object} child   Child class (function)
         * @param  {object} parent  Parent class (function)
         * @return {object}         Parent class (function).
         */
        function inherit(child, parent)
        {
            child.prototype = Object.create(parent.prototype);
            child.prototype.constructor = child;

            return parent;
        } api.inherit = inherit;

        /**
         * Gets the number of keys in a given object.
         * @param  {*}      object  Any object type.
         * @return {number}         Size of specified object (depending on the object type,
         *                          it can be the number of keys in a plain object, number
         *                          of elements in an array, number of characters in a
         *                          string, number of digits in a number, and 0 for all
         *                          other types.
         */
        function sizeOf(object)
        {
            // if object internally has length property, use it
            if (object.length !== undefined) return object.length;

            var size = 0;

            switch (typeof object)
            {
                case 'object':
                {
                    if (object !== null && object !== undefined)
                    {
                        for (var k in object) size++;
                    }

                    break;
                }

                case 'number':
                {
                    size = ('' + object).length;
                    break;
                }

                default:
                {
                    size = 0;
                    break;
                }
            }

            return size;
        } api.sizeOf = sizeOf;

        /**
         * Checks if a given object is equal to null (type-insensitive).
         * @param  {object}  object
         * @return {boolean}
         */
        function isNull(object)
        {
            if (object === undefined || object === null)
            {
                return true;
            }
            else
            {
                return false;
            }
        } api.isNull = isNull;

        /**
         * Detects touch screens.
         * @return {boolean}
         */
        function isTouchEnabled()
        {
            return ('ontouchstart' in window.document.documentElement);
        } api.isTouchEnabled = isTouchEnabled;

        return api;
    }
);
/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Delegate for managing update calls of a VARS modeled element.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define('ui/elementupdatedelegate',['../utils', '../enums/dirtytype'], function(utils, DirtyType) {

/**
 * @constructor
 * Creates a new ElementUpdateDelegate instance.
 */
function ElementUpdateDelegate(element)
{
    if (this.debug) utils.log('[ElementUpdateDelegate]::new(', element, ')');

    var mDirtyTable = 0;

    this.element = element;

    /**
     * @privileged
     * Sets a dirty type as dirty.
     * @param {number} dirtyType
     */
    this.setDirty = function(dirtyType, validateNow)
    {
        if (this.debug) utils.log('[ElementUpdateDelegate]::setDirty(', dirtyType, validateNow, ')');

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
        if (this.debug) utils.log('[ElementUpdateDelegate]::isDirty(', dirtyType, mDirtyTable, ')');

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
        if (this.debug) utils.log('[ElementUpdateDelegate]::init()');

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
        if (this.debug) utils.log('[ElementUpdateDelegate]::destroy()');

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
            if (this.debug) utils.log('[ElementUpdateDelegate]::update()');

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
     * @param  {function} callback
     */
    var _requestAnimationFrame = (window && window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame) || function(callback)
    {
        if (this.debug) utils.log('[ElementUpdateDelegate]::_requestAnimationFrame(', callback, ')');

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
}

/**
 * @property
 * Indicates whether this ElementUpdateDelegate instance generates debug data.
 * @type {object}
 */
Object.defineProperty(ElementUpdateDelegate.prototype, 'debug', { value: false, writable: true });

/**
 * @property
 * View of this ElementUpdateDelegate instance.
 * @type {object}
 */
Object.defineProperty(ElementUpdateDelegate.prototype, 'element', { value: null, writable: true });

/**
 * @property
 * Indicates whether this ElementUpdateDelegate auto responds to window behaviors.
 * @type {bool}
 */
Object.defineProperty(ElementUpdateDelegate.prototype, 'responsive', { value: false, writable: true });

return ElementUpdateDelegate; }
);
/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  View model of any DOM element.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define('ui/element',['../utils', '../enums/dirtytype', '../ui/elementupdatedelegate'], function(utils, DirtyType, ElementUpdateDelegate) {

/**
 * @constructor
 * Creates a new Element instance.
 */
function Element(element)
{
    if (this.debug) utils.log('[Element]::new(', element, ')');

    this.element = element;
    this.init();
}

/**
 * @property
 * View of this Element instance.
 * @type {object}
 */
Object.defineProperty(Element.prototype, 'element',
{
    get: function()
    {
        return this._element;
    },
    set: function(value)
    {
        // Ensure that this is not overwritable.
        utils.assert(!this._element, 'Element cannot be overwritten.');

        Object.defineProperty(this, '_element', { value: value, writable: true });

        this.updateDelegate.element = value;
    }
});

/**
 * @property
 * ID of this Element instance.
 * @type {string}
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
 * @type {string}
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
 * @type {object}
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
 * @type {bool}
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
 * @type {function}
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
    if (this.debug) utils.log('[Element]::init()');

    if (!this.element)
    {
        this.element = this.factory();
    }

    this.updateDelegate.init();
};

/**
 * @public
 * Destroys this Element instance.
 */
Element.prototype.destroy = function()
{
    if (this.debug) utils.log('[Element]::destroy()');

    this.updateDelegate.destroy();
};

/**
 * @public
 * Handler invoked whenever a visual update is required.
 */
Element.prototype.update = function()
{
    if (this.debug) utils.log('[Element]::update()');
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
 * @return {string}
 */
Element.prototype.toString = function()
{
    return '[Element{' + this.name + '}]';
};

return Element; });
/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  View model of DOM 'video' element.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define('ui/video',['../utils', '../enums/dirtytype', '../ui/element'], function(utils, DirtyType, Element) {

/**
 * @constructor
 * Creates a new Video instance.
 */
function Video(element)
{
    vars.ui.Element.call(this, element);

    if (this.debug) utils.log('[Video]::new(', element, ')');

    utils.assert(!element || (element instanceof HTMLVideoElement), 'Invalid element type specified. Must be an instance of HTMLVideoElement.');
}

var parent = utils.inherit(Video, Element);

/**
 * @static
 * Constants for the 'preload' attribute.
 * @type {object}
 * @see  http://www.w3schools.com/tags/tag_video.asp
 */
Video.PRELOAD =
{
    AUTO:     'auto',
    METADATA: 'metada',
    NONE:     'none'
};

/**
 * @property
 * Specifies that the video will start playing as soon as it is ready.
 * @type {boolean}
 */
Object.defineProperty(Video.prototype, 'autoplay',
{
    get: function()
    {
        return this.element.autoplay;
    },
    set: function(value)
    {
        this.element.autoplay = value;
        this.updateDelegate.setDirty(DirtyType.CUSTOM);
    }
});

/**
 * @property
 * Specifies that video controls should be displayed (such as a play/pause button etc).
 * @type {boolean}
 */
Object.defineProperty(Video.prototype, 'controls',
{
    get: function()
    {
        return this.element.controls;
    },
    set: function(value)
    {
        this.element.controls = value;
        this.updateDelegate.setDirty(DirtyType.CUSTOM);
    }
});

/**
 * @property
 * Specifies that the video will start over again, every time it is finished.
 * @type {boolean}
 */
Object.defineProperty(Video.prototype, 'loop',
{
    get: function()
    {
        return this.element.loop;
    },
    set: function(value)
    {
        this.element.loop = value;
        this.updateDelegate.setDirty(DirtyType.CUSTOM);
    }
});

/**
 * @property
 * Specifies that the audio output of the video should be muted.
 * @type {boolean}
 */
Object.defineProperty(Video.prototype, 'muted',
{
    get: function()
    {
        return this.element.muted;
    },
    set: function(value)
    {
        this.element.muted = value;
        this.updateDelegate.setDirty(DirtyType.CUSTOM);
    }
});

/**
 * @property
 * Specifies an image to be shown while the video is downloading, or until the user hits the play button.
 * @type {string}   URL of image
 */
Object.defineProperty(Video.prototype, 'poster',
{
    get: function()
    {
        return this.element.poster;
    },
    set: function(value)
    {
        this.element.poster = value;
        this.updateDelegate.setDirty(DirtyType.CUSTOM);
    }
});

/**
 * @property
 * Specifies if and how the author thinks the video should be loaded when the page loads
 * @type {string}   See Video.AUTOPLAY
 */
Object.defineProperty(Video.prototype, 'preload',
{
    get: function()
    {
        return this.element.preload;
    },
    set: function(value)
    {
        this.element.preload = value;
        this.updateDelegate.setDirty(DirtyType.CUSTOM);
    }
});

/**
 * @property
 * Array of sources containing elements in the form of:
 *     Object
 *     {
 *         src: {PATH_OF_SOURCE} (String)
 *         type: {TYPE_OF_SOURCE} (String)
 *     }
 * @type {array}
 */
Object.defineProperty(Video.prototype, 'source',
{
    get: function()
    {
        return this._source;
    },
    set: function(value)
    {
        Object.defineProperty(this, '_source', { value: value, writable: true });
        this.updateDelegate.setDirty(DirtyType.DATA);
    }
});

/**
 * @inheritDoc
 */
Video.prototype.update = function(dirtyTypes)
{
    if (this.debug) utils.log('[Video]::update()');

    if (this.isDirty(DirtyType.DATA))
    {
        this._updateSource();
    }

    if (this.isDirty(DirtyType.CUSTOM))
    {

    }

    parent.prototype.update.call(this, dirtyTypes);
};

/**
 * @inheritDoc
 */
Video.prototype.factory = function()
{
    return document.createElement('video');
};

/**
 * @private
 * Updates the sources in this Video instance.
 */
Video.prototype._updateSource = function()
{
    var i;
    var arrlen;

    // Update source(s).
    var oldSources = this.element.getElementsByTagName('source');

    arrlen = oldSources.length;

    for (i = 0; i < arrlen; i++)
    {
        var oldSource = oldSources[i];

        this.element.removeChild(oldSource);
    }

    if (!this.source) return;

    arrlen = this.source.length;

    for (i = 0; i < arrlen; i++)
    {
        var newSource = document.createElement('source');
        var path = this.source[i].src;
        var type = this.source[i].type;
        var ext = path.split('.').pop();

        newSource.setAttribute('src', path);
        newSource.setAttribute('type', type || 'video/'+ext);

        this.element.appendChild(newSource);
    }
};

return Video; });

/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  UI classes.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define('ui',['utils', 'ui/element', 'ui/video'], function(utils, Element, Video) {

var api = function(obj)
{
    return obj;
};

api.Element = Element;
api.Video = Video;

/**
 * Translates a DOM element.
 * @param  {object} element     Target DOM element
 * @param  {object} properties  Translation properties: top/right/bottom/left/units
 *                              (if any is specified, value must be number, else if object is undefined,
 *                              all transformation styles will be reset to 'initial')
 * @param  {object} constraints Translation constraints: top/right/bottom/left/units
 * @return {object} Translated properties.
 */
function translate(element, properties, constraints)
{
    if (properties)
    {
        utils.assert(!properties.top || !isNaN(properties.top), 'Top property must be a number.');
        utils.assert(!properties.right || !isNaN(properties.right), 'Right property must be a number.');
        utils.assert(!properties.bottom || !isNaN(properties.bottom), 'Bottom property must be a number.');
        utils.assert(!properties.left || !isNaN(properties.left), 'Left property must be a number.');

        var units = properties.units || 'px';

        if (constraints)
        {
            utils.assert(!constraints.top || !isNaN(constraints.top), 'Top constraint must be a number.');
            utils.assert(!constraints.right || !isNaN(constraints.right), 'Right constraint must be a number.');
            utils.assert(!constraints.bottom || !isNaN(constraints.bottom), 'Bottom constraint must be a number.');
            utils.assert(!constraints.left || !isNaN(constraints.left), 'Left constraint must be a number.');
        }

        var top = (constraints && constraints.top) ? Math.min(properties.top, constraints.top) : properties.top;
        var right = (constraints && constraints.right) ? Math.min(properties.right, constraints.right) : properties.right;
        var bottom = (constraints && constraints.bottom) ? Math.min(properties.bottom, constraints.bottom) : properties.bottom;
        var left = (constraints && constraints.left) ? Math.min(properties.left, constraints.left) : properties.left;

        if (element)
        {
            if (element.style)
            {
                element.style.top = String(top) + units;
                element.style.right = String(right) + units;
                element.style.bottom = String(bottom) + units;
                element.style.left = String(left) + units;
            }
            else if (element.css)
            {
                element.css({ 'top': String(top) + units });
                element.css({ 'right': String(right) + units });
                element.css({ 'bottom': String(bottom) + units });
                element.css({ 'left': String(left) + units });
            }
        }

        return { top: top, right: right, bottom: bottom, left: left };
    }
    else
    {
        if (element)
        {
            if (element.style)
            {
                element.style.top = 'initial';
                element.style.right = 'initial';
                element.style.bottom = 'initial';
                element.style.left = 'initial';
            }
            else if (element.css)
            {
                element.css({ 'top': 'initial' });
                element.css({ 'right': 'initial' });
                element.css({ 'bottom': 'initial' });
                element.css({ 'left': 'initial' });
            }
        }

        return { top: 'initial', right: 'initial', bottom: 'initial', left: 'initial' };
    }
} api.translate = translate;

/**
 * @todo Account for cases when either width or height is unspecified.
 * Transforms a DOM element.
 * @param  {object} element     Target DOM element.
 * @param  {object} properties  Transformation properties: width/height/units/aspectRatio
 *                              (if any is specified, value must be number, else if object is undefined,
 *                              all transformation styles will be reset to 'initial')
 * @param  {object} constraints Transformation constraints: width/height/units/type (optional, but must be numbers)
 * @return {object} Transformed properties.
 */
function transform(element, properties, constraints)
{
    if (properties)
    {
        utils.assert(!properties.width || !isNaN(properties.width), 'Width property must be a number.');
        utils.assert(!properties.height || !isNaN(properties.height), 'Height property must be a number.');
        utils.assert(!properties.aspectRatio || !isNaN(properties.aspectRatio), 'Aspect ratio property must be a number.');

        var units = properties.units || 'px';
        var aspectRatio = (properties.aspectRatio) ? Number(properties.aspectRatio) : properties.width/properties.height;
        var maxW = properties.width;
        var maxH = properties.height;
        var minW = properties.width;
        var minH = properties.height;
        var type = 'contain';

        if (constraints)
        {
            utils.assert(!constraints.width || !isNaN(constraints.width), 'Width constraint must be a number.');
            utils.assert(!constraints.height || !isNaN(constraints.height), 'Height constraint must be a number.');

            if (constraints.type && constraints.type === 'cover')
            {
                type = 'cover';

                if (constraints.width) minW = Math.min(constraints.width, minW);
                if (constraints.width) minH = Math.min(constraints.height, minH);
            }
            else
            {
                if (constraints.width) maxW = Math.min(constraints.width, maxW);
                if (constraints.height) maxH = Math.min(constraints.height, maxH);
            }
        }

        var w, h;

        if (type === 'contain')
        {
            w = (maxW > maxH) ? maxH * aspectRatio : maxW;
            h = (maxW > maxH) ? maxH : maxW / aspectRatio;

            if (w > maxW)
            {
                w = maxW;
                h = w / aspectRatio;
            }
            else if (h > maxH)
            {
                h = maxH;
                w = h * aspectRatio;
            }
        }
        else
        {
            w = (minW > minH) ? minH * aspectRatio : minW;
            h = (minW > minH) ? minH : minW / aspectRatio;

            if (w < minW)
            {
                w = minW;
                h = w / aspectRatio;
            }
            else if (h < minH)
            {
                h = minH;
                w = h * aspectRatio;
            }
        }

        if (element)
        {
            if (element.style)
            {
                if (properties.width) element.style.width = String(w) + units;
                if (properties.height) element.style.height = String(h) + units;
            }
            else if (element.css)
            {
                if (properties.width) element.css({ 'width': String(w) + units });
                if (properties.height) element.css({ 'height': String(h) + units });
            }
        }

        return { width: w, height: h };
    }
    else
    {
        if (element)
        {
            if (element.style)
            {
                element.style.width = 'initial';
                element.style.height = 'initial';
            }
            else if (element.css)
            {
                element.css({ 'width': 'initial' });
                element.css({ 'height': 'initial' });
            }
        }

        return { width: 'initial', height: 'initial' };
    }
} api.transform = transform;

/**
 * Gets the rect of the viewport (FOV).
 * @return {object} Object containing top, left, bottom, right, width, height.
 */
function getViewportRect()
{
    utils.assert(window && document, 'Window or document undefined.');

    if (!window || !document) return null;

    var rect = {};

    if ($)
    {
        rect.width  = $(window).innerWidth();
        rect.height = $(window).innerHeight();
        rect.top    = $(window).scrollTop();
        rect.left   = $(window).scrollLeft();
        rect.bottom = rect.top + rect.height;
        rect.right  = rect.left + rect.width;
    }
    else
    {
        rect.width  = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        rect.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        rect.top    = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
        rect.left   = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
        rect.bottom = rect.top + rect.height;
        rect.right  = rect.left + rect.width;
    }

    return rect;
} api.getViewportRect = getViewportRect;

/**
 * Gets the rect of a given element.
 * @param  {object} element
 * @return {object} Object containing top, left, bottom, right, width, height.
 */
function getRect(element)
{
    utils.assert(element, 'Invalid element specified.');
    utils.assert(window && document, 'Window or document undefined.');

    if (!element || !window || !document) return null;

    if (element === window || ($ && (element === $(window)))) return getViewportRect();

    var fov = getViewportRect();
    var rect = {};

    rect.width  = (element.outerWidth) ? element.outerWidth() : element.getBoundingClientRect().width;
    rect.height = (element.outerHeight) ? element.outerHeight() : element.getBoundingClientRect().height;
    rect.top    = (element.offset) ? element.offset().top : element.getBoundingClientRect().top - fov.y;
    rect.left   = (element.offset) ? element.offset().left : element.getBoundingClientRect().left - fov.x;
    rect.bottom = rect.top + rect.height;
    rect.right  = rect.left + rect.width;

    return rect;
} api.getRect = getRect;

/**
 * Computes the intersecting rect of 2 given elements. If only 1 element is specified, the other
 * element will default to the current viewport.
 * @param  {object} element1
 * @param  {object} element1
 * @return {object} Object containing width, height.
 */
function getIntersectRect(element1, element2)
{
    utils.assert(element1 || element2, 'Invalid elements specified.');
    utils.assert(window && document, 'Window or document undefined.');

    if (!(element1 || element2) || !(window && document)) return null;

    var rect1 = getRect(element1 || window);
    var rect2 = getRect(element2 || window);

    if (!rect1 || !rect2) return null;

    var rect = {};

    rect.width  = Math.max(0.0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
    rect.height = Math.max(0.0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
    rect.top    = Math.max(rect1.top, rect2.top);
    rect.left   = Math.max(rect1.left, rect2.left);
    rect.bottom = rect.top + rect.height;
    rect.right  = rect.left + rect.width;

    if (rect.width*rect.height === 0)
    {
        rect.width  = 0;
        rect.height = 0;
        rect.top    = 0;
        rect.left   = 0;
        rect.bottom = 0;
        rect.right  = 0;
    }

    return rect;
} api.getIntersectRect = getIntersectRect;

return api; });

/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Main library API.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    'vars',[
        'enums',
        'ui',
        'utils',
    ],
    function(enums, ui, utils)
    {
        var vars = function(obj)
        {
            return obj;
        };

        /**
         * Load utils module.
         * @type {object}
         */
        Object.defineProperty(vars, 'enums', { value: enums, writable: false });

        /**
         * Load ui module.
         * @type {object}
         */
        Object.defineProperty(vars, 'ui', { value: ui, writable: false });

        /**
         * Load utils module.
         * @type {object}
         */
        Object.defineProperty(vars, 'utils', { value: utils, writable: false });

        /**
         * Version.
         * @type {string}
         */
        Object.defineProperty(vars, 'version', { value: '0.1.0', writable: false });

        /**
         * Indicates whether VARS should use debug runtime.
         * @type {boolean}
         */
        Object.defineProperty(vars, 'debug',
        {
            get: function()
            {
                return vars.utils.debug;
            }.bind(this),
            set: function(value)
            {
                vars.utils.debug = value;
            }.bind(this)
        });

        return vars;
    }
);
/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  End file for r.js.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
    return require('vars');
}()));