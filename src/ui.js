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
        'utils',
        'ui/viewmodel'
    ],
    function(utils, ViewModel)
    {
        var api = function(obj)
        {
            return obj;
        };

        api.ViewModel = ViewModel;

        /**
         * Translates a DOM element.
         * @param  {object} element     Target DOM element
         * @param  {object} properties  Translation properties: top/right/bottom/left/units
         *                              (if any is specified, value must be number, else if object is undefined,
         *                              all transformation styles will be reset to 'initial')
         * @param  {object} constraints Translation constraints: top/right/bottom/left/units
         * @return {object} Translated properties.
         */
        function translate(element, properties, constraints)
        {
            if (properties)
            {
                utils.assert(!properties.top || !isNaN(properties.top), 'Top property must be a number.');
                utils.assert(!properties.right || !isNaN(properties.right), 'Right property must be a number.');
                utils.assert(!properties.bottom || !isNaN(properties.bottom), 'Bottom property must be a number.');
                utils.assert(!properties.left || !isNaN(properties.left), 'Left property must be a number.');

                var units = properties.units || 'px';

                if (constraints)
                {
                    utils.assert(!constraints.top || !isNaN(constraints.top), 'Top constraint must be a number.');
                    utils.assert(!constraints.right || !isNaN(constraints.right), 'Right constraint must be a number.');
                    utils.assert(!constraints.bottom || !isNaN(constraints.bottom), 'Bottom constraint must be a number.');
                    utils.assert(!constraints.left || !isNaN(constraints.left), 'Left constraint must be a number.');
                }

                var top = (constraints && constraints.top) ? Math.min(properties.top, constraints.top) : properties.top;
                var right = (constraints && constraints.right) ? Math.min(properties.right, constraints.right) : properties.right;
                var bottom = (constraints && constraints.bottom) ? Math.min(properties.bottom, constraints.bottom) : properties.bottom;
                var left = (constraints && constraints.left) ? Math.min(properties.left, constraints.left) : properties.left;

                if (element)
                {
                    if (element.style)
                    {
                        element.style.top = String(top) + units;
                        element.style.right = String(right) + units;
                        element.style.bottom = String(bottom) + units;
                        element.style.left = String(left) + units;
                    }
                    else if (element.css)
                    {
                        element.css({ 'top': String(top) + units });
                        element.css({ 'right': String(right) + units });
                        element.css({ 'bottom': String(bottom) + units });
                        element.css({ 'left': String(left) + units });
                    }
                }

                return { top: top, right: right, bottom: bottom, left: left };
            }
            else
            {
                if (element)
                {
                    if (element.style)
                    {
                        element.style.top = 'initial';
                        element.style.right = 'initial';
                        element.style.bottom = 'initial';
                        element.style.left = 'initial';
                    }
                    else if (element.css)
                    {
                        element.css({ 'top': 'initial' });
                        element.css({ 'right': 'initial' });
                        element.css({ 'bottom': 'initial' });
                        element.css({ 'left': 'initial' });
                    }
                }

                return { top: 'initial', right: 'initial', bottom: 'initial', left: 'initial' };
            }
        } api.translate = translate;

        /**
         * @todo Account for cases when either width or height is unspecified.
         * Transforms a DOM element.
         * @param  {object} element     Target DOM element.
         * @param  {object} properties  Transformation properties: width/height/units/aspectRatio
         *                              (if any is specified, value must be number, else if object is undefined,
         *                              all transformation styles will be reset to 'initial')
         * @param  {object} constraints Transformation constraints: width/height/units (optional, but must be numbers)
         * @return {object} Transformed properties.
         */
        function transform(element, properties, constraints)
        {
            if (properties)
            {
                utils.assert(!properties.width || !isNaN(properties.width), 'Width property must be a number.');
                utils.assert(!properties.height || !isNaN(properties.height), 'Height property must be a number.');
                utils.assert(!properties.aspectRatio || !isNaN(properties.aspectRatio), 'Aspect ratio property must be a number.');

                var units = properties.units || 'px';
                var aspectRatio = (properties.aspectRatio) ? Number(properties.aspectRatio) : properties.width/properties.height;
                var maxW = properties.width;
                var maxH = properties.height;

                if (constraints)
                {
                    utils.assert(constraints.width || !isNaN(constraints.width), 'Width constraint must be a number.');
                    utils.assert(constraints.height || !isNaN(constraints.height), 'Height constraint must be a number.');

                    if (constraints.width) maxW = Math.min(constraints.width, maxW);
                    if (constraints.height) maxH = Math.min(constraints.height, maxH);
                }

                var w = (maxW > maxH) ? maxH * aspectRatio : maxW;
                var h = (maxW > maxH) ? maxH : maxW / aspectRatio;

                if (w > maxW)
                {
                    w = maxW;
                    h = w / aspectRatio;
                }
                else if (h > maxH)
                {
                    h = maxH;
                    w = h * aspectRatio;
                }

                if (element)
                {
                    if (element.style)
                    {
                        if (properties.width) element.style.width = String(w) + units;
                        if (properties.height) element.style.height = String(h) + units;
                    }
                    else if (element.css)
                    {
                        if (properties.width) element.css({ 'width': String(w) + units });
                        if (properties.height) element.css({ 'height': String(h) + units });
                    }
                }

                return { width: w, height: h };
            }
            else
            {
                if (element)
                {
                    if (element.style)
                    {
                        element.style.width = 'initial';
                        element.style.height = 'initial';
                    }
                    else if (element.css)
                    {
                        element.css({ 'width': 'initial' });
                        element.css({ 'height': 'initial' });
                    }
                }

                return { width: 'initial', height: 'initial' };
            }
        } api.transform = transform;

        /**
         * Gets the rect of the viewport (FOV).
         * @return {object} Object containing top, left, bottom, right, width, height.
         */
        function getViewportRect()
        {
            utils.assert(window && document, 'Window or document undefined.');

            if (!window || !document) return null;

            var rect = {};

            if ($)
            {
                rect.width  = $(window).innerWidth();
                rect.height = $(window).innerHeight();
                rect.top    = $(window).scrollTop();
                rect.left   = $(window).scrollLeft();
                rect.bottom = rect.top + rect.height;
                rect.right  = rect.left + rect.width;
            }
            else
            {
                rect.width  = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
                rect.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                rect.top    = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
                rect.left   = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
                rect.bottom = rect.top + rect.height;
                rect.right  = rect.left + rect.width;
            }

            return rect;
        } api.getViewportRect = getViewportRect;

        /**
         * Gets the rect of a given element.
         * @param  {object} element
         * @return {object} Object containing top, left, bottom, right, width, height.
         */
        function getRect(element)
        {
            utils.assert(element, 'Invalid element specified.');
            utils.assert(window && document, 'Window or document undefined.');

            if (!element || !window || !document) return null;

            if (element === window || ($ && (element === $(window)))) return getViewportRect();

            var fov = getViewportRect();
            var rect = {};

            rect.width  = (element.outerWidth) ? element.outerWidth() : element.getBoundingClientRect().width;
            rect.height = (element.outerHeight) ? element.outerHeight() : element.getBoundingClientRect().height;
            rect.top    = (element.offset) ? element.offset().top : element.getBoundingClientRect().top - fov.y;
            rect.left   = (element.offset) ? element.offset().left : element.getBoundingClientRect().left - fov.x;
            rect.bottom = rect.top + rect.height;
            rect.right  = rect.left + rect.width;

            return rect;
        } api.getRect = getRect;

        /**
         * Computes the intersecting rect of 2 given elements. If only 1 element is specified, the other
         * element will default to the current viewport.
         * @param  {object} element1
         * @param  {object} element1
         * @return {object} Object containing width, height.
         */
        function getIntersectRect(element1, element2)
        {
            utils.assert(element1 || element2, 'Invalid elements specified.');
            utils.assert(window && document, 'Window or document undefined.');

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
        } api.getIntersectRect = getIntersectRect;

        return api;
    }
);