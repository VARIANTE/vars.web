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
         * @param  {Boolean}      keepElement
         */
        function toElementArray(element, keepElement)
        {
            if (!assert(element, 'Element is undefined or null.')) return null;

            var elements;

            if (element instanceof Array)
            {
                elements = element;
            }
            else if (element instanceof NodeList)
            {
                elements = Array.prototype.slice.call(element);
            }
            else if (element.jquery)
            {
                elements = element.get();
            }
            else
            {
                if (!assert((element instanceof HTMLElement) || (element instanceof Element), 'Invalid element specified. Element must be an instance of HTMLElement or VARS Element.')) return null;

                if (element instanceof HTMLElement)
                {
                    elements = [element];
                }
                else if (element instanceof Element)
                {
                    elements = [element.element];
                }
            }

            var n = sizeOf(elements);

            for (var i = 0; i < n; i++)
            {
                var e = elements[i];

                if (!assert((e instanceof HTMLElement) || (e instanceof Element), 'Element array contains invalid element(s). Each element must be an instance of HTMLElement or VARS Element.')) return null;

                if (!keepElement && (e instanceof Element))
                {
                    elements[i] = e.element;
                }
            }

            return elements;
        }

        return toElementArray;
    }
);
