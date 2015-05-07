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
        'utils/assert'
    ],
    function
    (
        assert
    )
    {
        /**
         * Gets the rect of the viewport (FOV).
         * @return {Object} Object containing top, left, bottom, right, width, height.
         */
        function getViewportRect()
        {
            assert(window && document, 'Window or document undefined.');

            if (!window || !document) return null;

            var rect = {};

            rect.width  = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            rect.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            rect.top    = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
            rect.left   = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
            rect.bottom = rect.top + rect.height;
            rect.right  = rect.left + rect.width;

            return rect;
        }

        return getViewportRect;
    }
);
