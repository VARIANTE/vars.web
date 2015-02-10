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
        'events',
        'ui',
        'utils'
    ],
    function
    (
        enums,
        events,
        ui,
        utils
    )
    {
        var vars = function(obj)
        {
            return obj;
        };

        /**
         * Version.
         * @type {String}
         */
        Object.defineProperty(vars, 'version', { value: '0.2.0', writable: false });

        /**
         * Indicates whether VARS should use debug runtime.
         * @type {Boolean}
         */
        Object.defineProperty(vars, 'debug', { value: false, writable: true });

        /**
         * Load enums module.
         * @type {Object}
         */
        extendAPI('enums', enums);

        /**
         * Load events module.
         * @type {Object}
         */
        extendAPI('events', events);

        /**
         * Load ui module.
         * @type {Object}
         */
        extendAPI('ui', ui);

        /**
         * Load utils module.
         * @type {Object}
         */
        extendAPI('utils', utils);

        /**
         * Appends a module to the main API.
         * @param  {String} name   Name of the module.
         * @param  {Object} module Module object.
         */
        function extendAPI(name, module)
        {
            Object.defineProperty(vars, name, { value: module, writable: false });

            for (var key in module)
            {
                if (module.hasOwnProperty(key))
                {
                    Object.defineProperty(vars, key, { value: module[key], writable: false });
                }
            }
        }

        return vars;
    }
);
