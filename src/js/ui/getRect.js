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
        'utils/assert',
        'ui/getViewportRect',
        'ui/Element'
    ],
    function
    (
        assert,
        getViewportRect,
        Element
    )
    {
        /**
         * Gets the rect of a given element.
         *
         * @param  {Object} element
         *
         * @return {Object} Object containing top, left, bottom, right, width, height.
         */
        function getRect(element)
        {
            if (!assert(element, 'Invalid element specified.')) return null;
            if (!assert(window, 'Window undefined.')) return null;

            if (element instanceof Element) element = element.element;

            if (element === window) return getViewportRect();

            var fov = getViewportRect();
            var rect = {};

            rect.width  = (element.outerWidth) ? element.outerWidth() : element.getBoundingClientRect().width;
            rect.height = (element.outerHeight) ? element.outerHeight() : element.getBoundingClientRect().height;
            rect.top    = (element.offset) ? element.offset().top : element.getBoundingClientRect().top + fov.top;
            rect.left   = (element.offset) ? element.offset().left : element.getBoundingClientRect().left + fov.left;
            rect.bottom = rect.top + rect.height;
            rect.right  = rect.left + rect.width;

            return rect;
        }

        return getRect;
    }
);
