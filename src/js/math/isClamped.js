/**
 * VARS
 * (c) VARIANTE (http://variante.io)
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
   * Determines if value is bounded by the specified min and max values,
   * defaults to inclusive.
   *
   * @param {Number}  value
   * @param {Number}  min
   * @param {Number}  max
   * @param {Boolean} exclusive:false
   *
   * @return {Boolean} True if bounded, false otherwise.
   */
  function isClamped(value, min, max, exclusive) {
    assertType(value, 'number', false, 'Invalid value specified');
    assertType(min, 'number', false, 'Invalid min value specified');
    assertType(max, 'number', false, 'Invalid max value specified');
    assertType(exclusive, 'boolean', true, 'Invalid parameter: exclusive');

    if (exclusive === undefined) exclusive = false;

    if (exclusive) {
      return ((value > min) && (value < max));
    }
    else {
      return ((value >= min) && (value <= max));
    }
  }

  return isClamped;
});
