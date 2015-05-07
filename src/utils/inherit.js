/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    [
    ],
    function
    (
    )
    {

        /**
         * Sets up prototypal inheritance between a child class and a parent class.
         * @param  {Object} child   Child class (function)
         * @param  {Object} parent  Parent class (function)
         * @return {Object}         Parent class (function).
         */
        function inherit(child, parent)
        {
            child.prototype = Object.create(parent.prototype);
            child.prototype.constructor = child;

            return parent;
        }

        return inherit;
    }
);
