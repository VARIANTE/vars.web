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
        'ui/viewcontroller'
    ],
    function(utils, ViewController)
    {
        var api = function(obj)
        {
            return obj;
        };

        api.ViewController = ViewController;

        /**
         * Translates a DOM element in 2D.
         * @param  {object} element    Target DOM element
         * @param  {object} properties Translation properties: top/right/bottom/left
         *                             (if this argument is unspecified, all translation styles
         *                             will be reset to 'initial')
         */
        function translate2D(element, properties)
        {
            utils.assert(element && element.style, 'Invalid element in argument.');

            if (!element || !element.style) return;

            if (properties)
            {
                if (properties.top) element.style.top = properties.top;
                if (properties.right) element.style.right = properties.right;
                if (properties.bottom) element.style.bottom = properties.bottom;
                if (properties.left) element.style.left = properties.left;
            }
            else
            {
                element.style.top = 'initial';
                element.style.right = 'initial';
                element.style.bottom = 'initial';
                element.style.left = 'initial';
            }
        } api.translate2D = translate2D;

        /**
         * Transforms a DOM element in 2D.
         * @param  {object} element    Target DOM element.
         * @param  {object} properties Transformation properties: width/height
         *                             (if this argument is unspecified, all transformation styles
         *                             will be reset to 'initial')
         */
        function transform2D(element, properties)
        {
            utils.assert(element && element.style, 'Invalid element in argument.');

            if (!element || !element.style) return;

            if (properties)
            {
                if (properties.width) element.style.width = properties.width;
                if (properties.height) element.style.height = properties.height;
            }
            else
            {
                element.style.width = 'initial';
                element.style.height = 'initial';
            }
        } api.transform2D = transform2D;

        return api;
    }
);