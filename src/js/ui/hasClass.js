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
  'ui/getClassIndex',
  'ui/toElementArray',
  'ui/Element',
  'helpers/assert'
], function(
  getClassIndex,
  toElementArray,
  Element,
  assert
) {
  /**
   * Verifies that the specified element(s) has the specified class.
   *
   * @param {*}      element    HTMLElement, VARS Element, or jQuery object.
   * @param {String} className
   *
   * @return {Boolean} True if element(s) has given class, false otherwise.
   */
  function hasClass(element, className) {
    if (!assert(className && (typeof className === 'string'), 'Invalid class name: ' + className)) return false;

    var elements = toElementArray(element);
    var n = elements.length;

    for (var i = 0; i < n; i++) {
      var e = elements[i];
      if (getClassIndex(e, className) < 0) return false;
    }

    return true;
  }

  return hasClass;
});
