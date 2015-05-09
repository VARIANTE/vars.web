/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Construction of the VARS API.
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
        var vars = function(obj) { return obj; };

        /**
         * Version.
         *
         * @type {String}
         */
        Object.defineProperty(vars, 'version', { value: '0.5.1', writable: false });

        /**
         * Indicates whether vars should behave in debug mode in runtime. This enables various
         * features such as logging and assertion.
         *
         * @type {Boolean}
         */
        Object.defineProperty(vars, 'debug', { value: false, writable: true });

        /**
         * Inject the 'enums' module and all of its sub-modules into the main vars module.
         */
        inject('enums', enums);

        /**
         * Inject the 'events' module and all of its sub-modules into the main vars module.
         */
        inject('events', events);

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
        function inject(name, module)
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
