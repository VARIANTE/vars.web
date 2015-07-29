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
        'ui/getRect',
        'ui/Element',
        'utils/assert',
        'utils/sizeOf'
    ],
    function
    (
        getRect,
        Element,
        assert,
        sizeOf
    )
    {
        /**
         * Computes the intersecting rect of 2 given elements. If only 1 element is specified, the other
         * element will default to the current viewport.
         *
         * @param  {Object/Array} arguments HTMLElement, VARS Element, or jQuery object.
         *
         * @return {Object} Object containing width, height.
         */
        function getIntersectRect()
        {
            if (!assert(window, 'This method relies on the window object, which is undefined.')) return null;

            var n = sizeOf(arguments);

            if (!assert(n > 0, 'This method requires at least 1 argument specified.')) return null;

            var rect = {};
            var currRect, nextRect;

            for (var i = 0; i < n; i++)
            {
                if (!currRect) currRect = getRect(arguments[i]);

                if (!assert(currRect, 'Invalid computed rect.')) return null;

                if (i === 0 && ((i+1) === n))
                {
                    nextRect = getRect(window);
                }
                else if ((i+1) < n)
                {
                    nextRect = getRect(arguments[i+1]);
                }
                else
                {
                    break;
                }

                if (!assert(nextRect, 'Invalid computed rect.')) return null;

                rect.width  = Math.max(0.0, Math.min(currRect.right, nextRect.right) - Math.max(currRect.left, nextRect.left));
                rect.height = Math.max(0.0, Math.min(currRect.bottom, nextRect.bottom) - Math.max(currRect.top, nextRect.top));
                rect.top    = Math.max(currRect.top, nextRect.top);
                rect.left   = Math.max(currRect.left, nextRect.left);
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

                currRect = rect;
            }

            return rect;
        }

        return getIntersectRect;
    }
);
