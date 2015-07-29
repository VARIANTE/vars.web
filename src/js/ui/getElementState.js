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
        'utils/assert',
        'utils/sizeOf'
    ],
    function
    (
        Element,
        assert,
        sizeOf
    )
    {
        /**
         * Gets the state of a DOM element, assumes that state classes are prefixed with 'state-'.
         *
         * @param  {Object} element HTMLElement, VARS Element, or jQuery object.
         *
         * @return {String} State of the given element ('state-' prefix is omitted).
         */
        function getElementState(element)
        {
            if (!assert((element) && ((element instanceof HTMLElement) || (element instanceof Element) || (element.jquery)), 'Invalid element specified.')) return null;

            if (element instanceof Element) element = element.element;
            if (element.jquery) element = element.get(0);

            var s = element.className.match(/(^|\s)state-\S+/g);
            var n = sizeOf(s);

            if (!assert(n <= 1, 'Multiple states detected.')) return null;

            if (n < 1)
            {
                return null;
            }
            else
            {
                return s[0].replace(/(^|\s)state-/, '');
            }
        }

        return getElementState;
    }
);
