/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define
(
    [
        'ui/Element',
        'ui/getClassIndex',
        'utils/assert'
    ],
    function
    (
        Element,
        getClassIndex,
        assert
    )
    {
        /**
         * Verifies that the specified element has the specified class.
         *
         * @param  {Object} element
         * @param  {String} className
         */
        function elementHasClass(element, className)
        {
            if (!assert((element) && ((element instanceof HTMLElement) || (element instanceof Element)), 'Invalid element specified. Element must be an instance of HTMLElement or Element.')) return null;
            if (element instanceof Element) element = element.element;

            if (!assert(className && (typeof className === 'string'), 'Invalid class name: ' + className)) return null;

            return (getClassIndex(element, className) > -1);
        }

        return elementHasClass;
    }
);
