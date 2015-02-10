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
    [
        'utils/assert',
        'utils/log',
        'utils/namespace',
        'utils/inherit',
        'utils/sizeof',
        'utils/isnull',
        'utils/assetloader'
    ],
    function
    (
        assert,
        log,
        namespace,
        inherit,
        sizeOf,
        isNull,
        AssetLoader
    )
    {
        var api = function(obj)
        {
            return obj;
        };

        /**
         * Asserts the specified condition and throws a warning if assertion fails.
         * @param  {Boolean} condition   Condition to validate against.
         * @param  {String}  message     (Optional) Message to be displayed when assertion fails.
         */
        Object.defineProperty(api, 'assert', { value: assert, writable: false, enumerable: true });

        /**
         * Logs to console.
         */
        Object.defineProperty(api, 'log', { value: log, writable: false, enumerable: true });

        /**
         * Creates the specified namespace in the specified scope.
         * @param  {String} identifiers Namespace identifiers with parts separated by dots.
         * @param  {Object} scope       (Optional) Object to create namespace in (defaults to window).
         * @return {Object}             Reference tothe created namespace.
         */
        Object.defineProperty(api, 'namespace', { value: namespace, writable: false, enumerable: true });

        /**
         * Sets up prototypal inheritance between a child class and a parent class.
         * @param  {Object} child   Child class (function)
         * @param  {Object} parent  Parent class (function)
         * @return {Object}         Parent class (function).
         */
        Object.defineProperty(api, 'inherit', { value: inherit, writable: false, enumerable: true });

        /**
         * Gets the number of keys in a given object.
         * @param  {*}      object  Any object type.
         * @return {Number}         Size of specified object (depending on the object type,
         *                          it can be the number of keys in a plain object, number
         *                          of elements in an array, number of characters in a
         *                          string, number of digits in a number, and 0 for all
         *                          other types.
         */
        Object.defineProperty(api, 'sizeOf', { value: sizeOf, writable: false, enumerable: true });

        /**
         * Checks if a given object is equal to null (type-insensitive).
         * @param  {Object}  object
         * @return {Boolean}
         */
        Object.defineProperty(api, 'isNull', { value: isNull, writable: false, enumerable: true });

        /**
         *  Asset loader for images, videos, and sounds.
         */
        Object.defineProperty(api, 'AssetLoader', { value: AssetLoader, writable: false, enumerable: true });

        return api;
    }
);
