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