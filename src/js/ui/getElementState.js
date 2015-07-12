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
        'utils/assert',
        'utils/sizeOf'
    ],
    function
    (
        assert,
        sizeOf
    )
    {
        /**
         * Gets the state of a DOM element, assumes that state classes
         * are prefixed with 'state-'.
         *
         * @param  {Object} element
         */
        function getElementState(element)
        {
            if (!assert((element) && (element instanceof HTMLElement), 'Invalid element specified. Element must be an instance of HTMLElement')) return;

            var s = element.className.match(/(^|\s)state-\S+/g);
            var n = sizeOf(s);

            if (!assert(n <= 1, 'Multiple states detected.')) return null;

            if (n < 1)
            {
                return null;
            }
            else
            {
                return s[0];
            }
        }

        return getElementState;
    }
);
