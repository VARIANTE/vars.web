/**
 * VARS
 * (c) Andrew Wei
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */

'use strict';

define([
  'helpers/assertType'
],function(
  assertType
) {
  /**
   * Determines if a number is an even number. Zero is considered even by
   * default.
   *
   * @param {Number}  value
   * @param {Boolean} excludeZero:false
   *
   * @return {Boolean} True if number is even, false otherwise.
   */
  function isEven(value, excludeZero) {
    assertType(value, 'number', false, 'Invalid value specified');
    assertType(excludeZero, 'boolean', true, 'Invalid parameter: excludeZero');

    if (excludeZero === undefined) excludeZero = false;

    if (value === 0) return !excludeZero;

    return (value % 2) === 0;
  }

  return isEven;
});
