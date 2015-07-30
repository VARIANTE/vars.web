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
        'math/isClamped',
        'ui/getIntersectRect',
        'ui/getRect',
        'ui/toElementArray',
        'utils/assert',
        'utils/sizeOf'
    ],
    function
    (
        isClamped,
        getIntersectRect,
        getRect,
        toElementArray,
        assert,
        sizeOf
    )
    {
        /**
         * Hit tests a vector or element against other elements.
         *
         * @param  {Object/Array} Vector ({ x, y }), HTMLElement, VARS Element, or jQuery object.
         * @param  {Object/Array} HTMLElement, VARS Element, or jQuery object.
         *
         * @return {Boolean} True if test passes, false otherwise.
         */
        function hitTestRect()
        {
            if (!assert(sizeOf(arguments) > 1, 'Insufficient arguments. Expecting at least 2.')) return false;

            var args = Array.prototype.slice.call(arguments);
            var isVector = (typeof args[0] === 'object') && args[0].hasOwnProperty('x') && args[0].hasOwnProperty('y');

            if (isVector)
            {
                var vector = args.shift();
                var n = sizeOf(args);
                var pass = false;

                for (var i = 0; i < n; i++)
                {
                    var rect = args[i];
                    if (!assert(rect.top !== undefined && !isNaN(rect.top) && rect.right !== undefined && !isNaN(rect.right) && rect.bottom !== undefined && !isNaN(rect.bottom) && rect.left !== undefined && !isNaN(rect.left), 'Invalid rect supplied. Rect must be an object containing "top", "right", "bottom", and "left" key values.')) return false;

                    if (isClamped(vector.x, rect.left, rect.right) && isClamped(vector.y, rect.top, rect.bottom))
                    {
                        pass = true;
                    }
                }

                return pass;
            }
            else
            {
                var intersectRect = getIntersectRect.apply(null, arguments);

                if (!assert(intersectRect, 'Invalid elements specified.')) return false;

                return (intersectRect.width * intersectRect.height !== 0);
            }
        }

        return hitTestRect;
    }
);
