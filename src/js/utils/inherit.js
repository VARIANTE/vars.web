/**
 *  vars
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
         * Sets up prototypal inheritance between a child class and a parent class. This process
         * also creates a new prototype method hasProperty() for the child class which allows
         * verifying inherited properties (as opposed to the native hasOwnProperty() method).
         *
         * @param  {Object} child   Child class (function)
         * @param  {Object} parent  Parent class (function)
         *
         * @return {Object} Parent class (function).
         */
        function inherit(child, parent)
        {
            child.prototype = Object.create(parent.prototype);
            child.prototype.constructor = child;

            // Create a 'hasProperty' member during the process to be able to identify all immediate and inherited properties.
            Object.defineProperty(child.prototype, 'hasProperty',
            {
                value: function(prop)
                {
                    return child.prototype.hasOwnProperty(prop) || (parent.prototype.hasProperty && parent.prototype.hasProperty(prop)) || parent.prototype.hasOwnProperty(prop);
                },
                writable: false
            });

            return parent;
        }

        return inherit;
    }
);
