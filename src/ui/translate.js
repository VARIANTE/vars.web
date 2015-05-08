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
         * Translates a DOM element.
         * @param  {Object} element     Target DOM element
         * @param  {Object} properties  Translation properties:
         *                              {
         *                                  {Number} top:    Top translation value
         *                                  {Number} right:  Right translation value
         *                                  {Number} bottom: Bottom translation value
         *                                  {Number} left:   Left translation value
         *                                  {String} units:  Unit of translation values
         *                              }
         *                              (if unspecified, all translation values will be reset to 'initial')
         * @param  {Object} constraints Translation constraints:
         *                              {
         *                                  {Number} top:    Bounded top translation value
         *                                  {Number} right:  Bounded right translation value
         *                                  {Number} bottom: Bounded bottom translation value
         *                                  {Number} left:   Bounded left translation value
         *                              }
         * @return {Object} Translated properties.
         */
        function translate(element, properties, constraints)
        {
            if (properties)
            {
                if (!assert(!properties.top || !isNaN(properties.top), 'Top property must be a number.')) return null;
                if (!assert(!properties.right || !isNaN(properties.right), 'Right property must be a number.')) return null;
                if (!assert(!properties.bottom || !isNaN(properties.bottom), 'Bottom property must be a number.')) return null;
                if (!assert(!properties.left || !isNaN(properties.left), 'Left property must be a number.')) return null;

                var units = properties.units || 'px';

                if (constraints)
                {
                    if (!assert(!constraints.top || !isNaN(constraints.top), 'Top constraint must be a number.')) return null;
                    if (!assert(!constraints.right || !isNaN(constraints.right), 'Right constraint must be a number.')) return null;
                    if (!assert(!constraints.bottom || !isNaN(constraints.bottom), 'Bottom constraint must be a number.')) return null;
                    if (!assert(!constraints.left || !isNaN(constraints.left), 'Left constraint must be a number.')) return null;
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
        }

        return translate;
    }
);
