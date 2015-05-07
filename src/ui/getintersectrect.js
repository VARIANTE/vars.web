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
        'utils/assert',
        'ui/getrect'
    ],
    function
    (
        assert,
        getRect
    )
    {
        /**
         * Computes the intersecting rect of 2 given elements. If only 1 element is specified, the other
         * element will default to the current viewport.
         * @param  {Object} element1
         * @param  {Object} element1
         * @return {Object} Object containing width, height.
         */
        function getIntersectRect(element1, element2)
        {
            assert(element1 || element2, 'Invalid elements specified.');
            assert(window && document, 'Window or document undefined.');

            if (!(element1 || element2) || !(window && document)) return null;

            var rect1 = getRect(element1 || window);
            var rect2 = getRect(element2 || window);

            if (!rect1 || !rect2) return null;

            var rect = {};

            rect.width  = Math.max(0.0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
            rect.height = Math.max(0.0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
            rect.top    = Math.max(rect1.top, rect2.top);
            rect.left   = Math.max(rect1.left, rect2.left);
            rect.bottom = rect.top + rect.height;
            rect.right  = rect.left + rect.width;

            if (rect.width*rect.height === 0)
            {
                rect.width  = 0;
                rect.height = 0;
                rect.top    = 0;
                rect.left   = 0;
                rect.bottom = 0;
                rect.right  = 0;
            }

            return rect;
        }

        return getIntersectRect;
    }
);
