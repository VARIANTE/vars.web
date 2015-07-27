/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Module of methods/classes related to UI manipulation and
 * operations.
 *
 * @type {Module}
 */
define
(
    [
        'ui/changeElementState',
        'ui/getClassIndex',
        'ui/getChildElements',
        'ui/getElementState',
        'ui/getIntersectRect',
        'ui/getRect',
        'ui/getViewportRect',
        'ui/initDOM',
        'ui/transform',
        'ui/translate',
        'ui/translate3d',
        'ui/Directives',
        'ui/Element',
        'ui/ElementUpdateDelegate',
        'ui/Video'
    ],
    function
    (
        changeElementState,
        getClassIndex,
        getChildElements,
        getElementState,
        getIntersectRect,
        getRect,
        getViewportRect,
        initDOM,
        transform,
        translate,
        translate3d,
        Directives,
        Element,
        ElementUpdateDelegate,
        Video
    )
    {
        var api = function(obj) { return obj; };

        Object.defineProperty(api, 'changeElementState', { value: changeElementState, writable: false, enumerable: true });
        Object.defineProperty(api, 'getClassIndex', { value: getClassIndex, writable: false, enumerable: true });
        Object.defineProperty(api, 'getChildElements', { value: getChildElements, writable: false, enumerable: true });
        Object.defineProperty(api, 'getElementState', { value: getElementState, writable: false, enumerable: true });
        Object.defineProperty(api, 'getIntersectRect', { value: getIntersectRect, writable: false, enumerable: true });
        Object.defineProperty(api, 'getRect', { value: getRect, writable: false, enumerable: true });
        Object.defineProperty(api, 'getViewportRect', { value: getViewportRect, writable: false, enumerable: true });
        Object.defineProperty(api, 'initDOM', { value: initDOM, writable: false, enumerable: true });
        Object.defineProperty(api, 'translate', { value: translate, writable: false, enumerable: true });
        Object.defineProperty(api, 'translate3d', { value: translate3d, writable: false, enumerable: true });
        Object.defineProperty(api, 'transform', { value: transform, writable: false, enumerable: true });
        Object.defineProperty(api, 'Directives', { value: Directives, writable: false, enumerable: true });
        Object.defineProperty(api, 'Element', { value: Element, writable: false, enumerable: true });
        Object.defineProperty(api, 'ElementUpdateDelegate', { value: ElementUpdateDelegate, writable: false, enumerable: true });
        Object.defineProperty(api, 'Video', { value: Video, writable: false, enumerable: true });

        return api;
    }
);
