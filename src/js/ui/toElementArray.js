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
         * Transforms given element(s) to an element array.
         *
         * @param  {Object/Array} element
         */
        function toElementArray(element)
        {
            if (!assert(element, 'Element is undefined or null.')) return null;

            var elements;

            if (element instanceof Array)
            {
                elements = element;
            }
            else if (element.jquery)
            {
                elements = element.get();
            }
            else
            {
                if (!assert((element instanceof HTMLElement) || (element instanceof Element), 'Invalid element specified. Element must be an instance of HTMLElement or VARS Element.')) return null;

                elements = [element];
            }

            var n = sizeOf(elements);

            for (var i = 0; i < n; i++)
            {
                var e = elements[i];

                if (!assert((e instanceof HTMLElement) || (e instanceof Element), 'Element array contains invalid element(s). Each element must be an instance of HTMLElement or VARS Element.')) return null;

                if (e instanceof Element)
                {
                    elements[i] = e.element;
                }
            }

            return elements;
        }

        return toElementArray;
    }
);
