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
        'utils/assert'
    ],
    function
    (
        Element,
        assert
    )
    {
        /**
         * Gets the index of a specified class in a DOM element,
         *
         * @param  {Object} element
         * @param  {String} className
         */
        function getClassIndex(element, className)
        {
            if (!assert((element) && ((element instanceof HTMLElement) || (element instanceof Element)), 'Invalid element specified. Element must be an instance of HTMLElement or Element.')) return null;
            if (element instanceof Element) element = element.element;

            if (!assert(className && (typeof className === 'string'), 'Invalid class name: ' + className)) return null;

            if (!element.className) return -1;

            var classList = element.className.split(' ');

            return classList.indexOf(className);
        }

        return getClassIndex;
    }
);
