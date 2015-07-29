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
        'ui/toElementArray',
        'utils/assert',
        'utils/sizeOf'
    ],
    function
    (
        toElementArray,
        assert,
        sizeOf
    )
    {
        /**
         * Translates a DOM element.
         *
         * @param  {Object/Array} element   HTMLElement, VARS Element, or jQuery object.
         * @param  {Object} properties      Translation properties:
         *                                  {
         *                                      {Number} top:    Top translation value
         *                                      {Number} right:  Right translation value
         *                                      {Number} bottom: Bottom translation value
         *                                      {Number} left:   Left translation value
         *                                      {String} units:  Unit of translation values
         *                                  }
         *                                  (if unspecified, all translation values will be reset to 'initial')
         * @param  {Object} constraints     Translation constraints:
         *                                  {
         *                                      {Number} top:    Bounded top translation value
         *                                      {Number} right:  Bounded right translation value
         *                                      {Number} bottom: Bounded bottom translation value
         *                                      {Number} left:   Bounded left translation value
         *                                  }
         *
         * @return {Object} Translated properties.
         */
        function translate(element, properties, constraints)
        {
            var elements = toElementArray(element);
            var n = sizeOf(elements);

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

                for (var i = 0; i < n; i++)
                {
                    if (properties.top) elements[i].style.top = String(top) + units;
                    if (properties.right) elements[i].style.right = String(right) + units;
                    if (properties.bottom) elements[i].style.bottom = String(bottom) + units;
                    if (properties.left) elements[i].style.left = String(left) + units;
                }

                var t = {};

                if (properties.top) t.top = top;
                if (properties.right) t.right = right;
                if (properties.bottom) t.bottom = bottom;
                if (properties.left) t.left = left;

                return t;
            }
            else
            {
                for (var j = 0; j < n; j++)
                {
                    elements[j].style.top = 'initial';
                    elements[j].style.right = 'initial';
                    elements[j].style.bottom = 'initial';
                    elements[j].style.left = 'initial';
                }

                return { top: 'initial', right: 'initial', bottom: 'initial', left: 'initial' };
            }
        }

        return translate;
    }
);
