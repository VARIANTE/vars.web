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
        'ui/elementHasClass',
        'ui/toElementArray',
        'ui/Element',
        'utils/assert',
        'utils/sizeOf'
    ],
    function
    (
        elementHasClass,
        toElementArray,
        Element,
        assert,
        sizeOf
    )
    {
        /**
         * Changes the state of DOM element(s), assumes that state classes are prefixed
         * with 'state-'.
         *
         * @param  {Object/Array} element   HTMLElement, VARS Element, or jQuery object.
         * @param  {String}       state
         */
        function changeElementState(element, state)
        {
            var elements = toElementArray(element);
            var n = sizeOf(elements);

            for (var i = 0; i < n; i++)
            {
                var e = elements[i];

                if (elementHasClass(e, 'state'+state)) continue;
                e.className = e.className.replace(/(^|\s)state-\S+/g, '');
                e.className = e.className + ((e.className === '') ? '' : ' ') + ('state-'+state);
            }
        }

        return changeElementState;
    }
);
