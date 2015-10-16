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
     * Determines if value is bounded by the specified min and max values, defaults to inclusive.
     *
     * @param  {Number} value
     * @param  {Number} min
     * @param  {Number} max
     * @param  {Boolean} exclusive
     *
     * @return {Boolean} True if bounded, false otherwise.
     */
    function isClamped(value, min, max, exclusive) {
      if (exclusive) {
        return ((value > min) && (value < max));
      }
      else {
        return ((value >= min) && (value <= max));
      }
    }

    return isClamped;
  }
);
