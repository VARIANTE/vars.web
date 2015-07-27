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
        'utils/assert'
    ],
    function
    (
        assert
    )
    {
        /**
         * Translates a DOM element.
         *
         * @param  {Object} element     Target DOM element
         * @param  {Object} properties  Translation properties: x/y/z/units
         *                              {
         *                                  {Number} x:     X-coordinate
         *                                  {Number} y:     Y-coordinate
         *                                  {Number} z:     Z-coordinate
         *                                  {String} units: Unit of translation values
         *                              }
         *                              (if unspecified, all translation coordinates will be reset to 0)
         * @param  {Object} constraints Translation constraints:
         *                              {
         *                                  {Number} x:     Bounded x-coordinate
         *                                  {Number} y:     Bounded y-coordinate
         *                                  {Number} z:     Bounded z-coordinate
         *                              }
         *
         * @return {Object} Translated properties.
         */
        function translate3d(element, properties, constraints)
        {
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

                if (element)
                {
                    var translateX = properties.x ? 'translateX('+x+units+')' : null;
                    var translateY = properties.y ? 'translateY('+y+units+')' : null;
                    var translateZ = properties.z ? 'translateZ('+z+units+')' : null;
                    var transforms = '';

                    if (translateX) transforms += (transforms === '') ? translateX : ' ' + translateX;
                    if (translateY) transforms += (transforms === '') ? translateY : ' ' + translateY;
                    if (translateZ) transforms += (transforms === '') ? translateZ : ' ' + translateZ;

                    if (element.style)
                    {
                        element.style.transform = (transforms);
                    }
                    else if (element.css)
                    {
                        element.css('transform', transforms);
                    }
                }

                return { x: x, y: y, z: z };
            }
            else
            {
                if (element)
                {
                    if (element.style)
                    {
                        element.style.transform = 'translateX(0) translateY(0) translateZ(0)';
                    }
                    else if (element.css)
                    {
                        element.css({ 'transform': 'translateX(0) translateY(0) translateZ(0)' });
                    }
                }

                return { x: 0, y: 0, z: 0 };
            }
        }

        return translate3d;
    }
);
