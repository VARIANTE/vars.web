/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  UI classes.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    [
        'ui/translate',
        'ui/transform',
        'ui/getviewportrect',
        'ui/getrect',
        'ui/getintersectrect',
        'ui/element',
        'ui/video',
        'ui/elementupdatedelegate'
    ],
    function
    (
        translate,
        transform,
        getViewportRect,
        getRect,
        getIntersectRect,
        Element,
        Video,
        ElementUpdateDelegate
    )
    {
        var api = function(obj)
        {
            return obj;
        };

        /**
         * Translates a DOM element.
         * @param  {Object} element     Target DOM element
         * @param  {Object} properties  Translation properties: top/right/bottom/left/units
         *                              (if any is specified, value must be number, else if object is undefined,
         *                              all transformation styles will be reset to 'initial')
         * @param  {Object} constraints Translation constraints: top/right/bottom/left/units
         * @return {Object} Translated properties.
         */
        Object.defineProperty(api, 'translate', { value: translate, writable: false, enumerable: true });

        /**
         * @todo Account for cases when either width or height is unspecified.
         * Transforms a DOM element.
         * @param  {Object} element     Target DOM element.
         * @param  {Object} properties  Transformation properties: width/height/units/aspectRatio
         *                              (if any is specified, value must be number, else if object is undefined,
         *                              all transformation styles will be reset to 'initial')
         * @param  {Object} constraints Transformation constraints: width/height/units/type (optional, but must be numbers)
         * @return {Object} Transformed properties.
         */
        Object.defineProperty(api, 'transform', { value: transform, writable: false, enumerable: true });

        /**
         * Gets the rect of the viewport (FOV).
         * @return {Object} Object containing top, left, bottom, right, width, height.
         */
        Object.defineProperty(api, 'getViewportRect', { value: getViewportRect, writable: false, enumerable: true });

        /**
         * Gets the rect of a given element.
         * @param  {Object} element
         * @return {Object} Object containing top, left, bottom, right, width, height.
         */
        Object.defineProperty(api, 'getRect', { value: getRect, writable: false, enumerable: true });

        /**
         * Computes the intersecting rect of 2 given elements. If only 1 element is specified, the other
         * element will default to the current viewport.
         * @param  {Object} element1
         * @param  {Object} element1
         * @return {Object} Object containing width, height.
         */
        Object.defineProperty(api, 'getIntersectRect', { value: getIntersectRect, writable: false, enumerable: true });

        /**
         * View model of any DOM element.
         */
        Object.defineProperty(api, 'Element', { value: Element, writable: false, enumerable: true });

        /**
         * View model of DOM 'video' element.
         * @type {[type]}
         */
        Object.defineProperty(api, 'Video', { value: Video, writable: false, enumerable: true });

        /**
         *  Delegate for managing update calls of a VARS modeled element.
         */
        Object.defineProperty(api, 'ElementUpdateDelegate', { value: ElementUpdateDelegate, writable: false, enumerable: true });

        return api;
    }
);
