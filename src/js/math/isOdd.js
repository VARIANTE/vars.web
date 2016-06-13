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
   * Determines if a number is an odd number.
   *
   * @param {Number} value
   *
   * @return {Boolean} True if number is odd, false otherwise.
   */
  function isOdd(value) {
    assertType(value, 'number', false, 'Invalid value specified');

    if (value === 0) return false;

    return (value % 2) !== 0;
  }

  return isOdd;
});
