/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define([
  ],
  function() {
    /**
     * Determines if a number is an even number. Zero is considered even by default.
     *
     * @param  {Number}  value
     * @param  {Boolean} excludeZero
     *
     * @return {Boolean} True if number is even, false otherwise.
     */
    function isEven(value, excludeZero) {
      if (value === 0) return (excludeZero !== false);

      return (value % 2) === 0;
    }

    return isEven;
  }
);
