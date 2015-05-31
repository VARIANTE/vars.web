/**
 *  vars
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
         * Transforms a DOM element.
         *
         * @param  {Object} element     Target DOM element.
         * @param  {Object} properties  Transformation properties:
         *                              {
         *                                  {Number} width:  Target width of the element
         *                                  {Number} height: Target height of the element
         *                                  {String} unit:   Unit of width/height values
         *                                  {String} type:   Resizing constraint: 'default', 'contain', 'cover'
         *                              }
         *                              (if unspecified, all transformation styles will be reset to 'initial')
         * @param  {Object} constraints Transformation constraints:
         *                              {
         *                                  {Number} width:  Bounded width of the element.
         *                                  {Number} height: Bounded height of the element.
         *                              }
         *
         * @return {Object} Transformed properties.
         */
        function transform(element, properties, constraints)
        {
            if (properties)
            {
                if (!assert(!properties.width || !isNaN(properties.width), 'Width property must be a number.')) return null;
                if (!assert(!properties.height || !isNaN(properties.height), 'Height property must be a number.')) return null;
                if (!assert(!properties.aspectRatio || !isNaN(properties.aspectRatio), 'Aspect ratio property must be a number.')) return null;

                var units = properties.units || 'px';
                var aspectRatio = (properties.aspectRatio) ? Number(properties.aspectRatio) : properties.width/properties.height;
                var maxW = properties.width;
                var maxH = properties.height;
                var minW = properties.width;
                var minH = properties.height;
                var type = properties.type || 'default';

                if (constraints && type !== 'default')
                {
                    assert(!constraints.width || !isNaN(constraints.width), 'Width constraint must be a number.');
                    assert(!constraints.height || !isNaN(constraints.height), 'Height constraint must be a number.');

                    if (type && type === 'cover')
                    {
                        if (constraints.width) minW = Math.min(constraints.width, minW);
                        if (constraints.width) minH = Math.min(constraints.height, minH);
                    }
                    else
                    {
                        if (constraints.width) maxW = Math.min(constraints.width, maxW);
                        if (constraints.height) maxH = Math.min(constraints.height, maxH);
                    }
                }

                var w, h;

                if (type === 'contain')
                {
                    w = (maxW > maxH) ? maxH * aspectRatio : maxW;
                    h = (maxW > maxH) ? maxH : maxW / aspectRatio;

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
                }
                else if (type == 'cover')
                {
                    w = (minW > minH) ? minH * aspectRatio : minW;
                    h = (minW > minH) ? minH : minW / aspectRatio;

                    if (w < minW)
                    {
                        w = minW;
                        h = w / aspectRatio;
                    }
                    else if (h < minH)
                    {
                        h = minH;
                        w = h * aspectRatio;
                    }
                }
                else
                {
                    w = maxW;
                    h = maxH;
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
        }

        return transform;
    }
);
