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
     * Determines if a number is an odd number.
     *
     * @param {Number} value
     *
     * @return {Boolean} True if number is odd, false otherwise.
     */
    function isOdd(value) {
      if (value === 0) return false;

      return (value % 2) !== 0;
    }

    return isOdd;
  }
);
