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
         * @param  {Object} properties      Translation properties: x/y/z/units
         *                                  {
         *                                  	{Number} x:     X-coordinate
         *                                   	{Number} y:     Y-coordinate
         *                                    	{Number} z:     Z-coordinate
         *                                     	{String} units: Unit of translation values
         *                                  }
         *                                  (if unspecified, all translation coordinates will be reset to 0)
         * @param  {Object} constraints     Translation constraints:
         *                                  {
         *                                  	{Number} x:     Bounded x-coordinate
         *                                   	{Number} y:     Bounded y-coordinate
         *                                    	{Number} z:     Bounded z-coordinate
         *                                  }
         *
         * @return {Object} Translated properties.
         */
        function translate3d(element, properties, constraints)
        {
            var elements = toElementArray(element);
            var n = sizeOf(elements);

            if (properties)
            {
                if (!assert(!properties.x || !isNaN(properties.x), 'X property must be a number.')) return null;
                if (!assert(!properties.y || !isNaN(properties.y), 'Y property must be a number.')) return null;
                if (!assert(!properties.z || !isNaN(properties.z), 'Z property must be a number.')) return null;

                var units = properties.units || 'px';

                if (constraints)
                {
                    if (!assert(!constraints.x || !isNaN(constraints.x), 'X constraint must be a number.')) return null;
                    if (!assert(!constraints.y || !isNaN(constraints.y), 'Y constraint must be a number.')) return null;
                    if (!assert(!constraints.z || !isNaN(constraints.z), 'Z constraint must be a number.')) return null;
                }

                var x = (constraints && constraints.x) ? Math.min(properties.x, constraints.x) : properties.x;
                var y = (constraints && constraints.y) ? Math.min(properties.y, constraints.y) : properties.y;
                var z = (constraints && constraints.z) ? Math.min(properties.z, constraints.z) : properties.z;

                var translateX = properties.x ? 'translateX('+x+units+')' : null;
                var translateY = properties.y ? 'translateY('+y+units+')' : null;
                var translateZ = properties.z ? 'translateZ('+z+units+')' : null;
                var transforms = '';

                if (translateX) transforms += (transforms === '') ? translateX : ' ' + translateX;
                if (translateY) transforms += (transforms === '') ? translateY : ' ' + translateY;
                if (translateZ) transforms += (transforms === '') ? translateZ : ' ' + translateZ;

                for (var i = 0; i < n; i++)
                {
                    elements[i].style.transform = transforms;
                }

                var t = {};

                if (translateX) t.x = x;
                if (translateY) t.y = y;
                if (translateZ) t.z = z;

                return t;
            }
            else
            {
                for (var j = 0; j < n; j++)
                {
                    elements[j].style.transform = 'translateX(0) translateY(0) translateZ(0)';
                }

                return { x: 0, y: 0, z: 0 };
            }
        }

        return translate3d;
    }
);
