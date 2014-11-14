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
    [
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