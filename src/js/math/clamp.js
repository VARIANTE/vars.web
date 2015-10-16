/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */

'use strict';

define([],
  function() {
    /**
     * Clamps a value to a min and max value.
     *
     * @param  {Number} value
     * @param  {Number} min
     * @param  {Number} max
     *
     * @return {Number} The clamped value.
     */
    function clamp(value, min, max) {
      if ((typeof value !== 'number') || (typeof min !== 'number') || (typeof max !== 'number')) return NaN;

      var output = value;

      output = Math.min(output, max);
      output = Math.max(output, min);

      return output;
    }

    return clamp;
  }
);
