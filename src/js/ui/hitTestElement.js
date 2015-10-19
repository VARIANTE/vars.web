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
  'math/isClamped',
  'ui/getIntersectRect',
  'ui/getRect',
  'ui/toElementArray',
  'helpers/assert'
], function(
  isClamped,
  getIntersectRect,
  getRect,
  toElementArray,
  helpers
) {
  /**
   * Hit tests a vector or element against other elements.
   *
   * @param {Object/Array}  Vector ({ x, y }), HTMLElement, VARS Element, or
   *                        jQuery object.
   * @param {Object/Array}  HTMLElement, VARS Element, or jQuery object.
   *
   * @return {Boolean} True if test passes, false otherwise.
   */
  function hitTestElement() {
    if (!assert(arguments.length > 1, 'Insufficient arguments. Expecting at least 2.')) return false;

    var args = Array.prototype.slice.call(arguments);
    var isVector = (typeof args[0] === 'object') && args[0].hasOwnProperty('x') && args[0].hasOwnProperty('y');

    if (isVector) {
      var vector = args.shift();
      var n = args.length;
      var pass = false;

      for (var i = 0; i < n; i++) {
        var rect = getRect(args[i]);

        if (isClamped(vector.x, rect.left, rect.right) && isClamped(vector.y, rect.top, rect.bottom)) {
          pass = true;
        }
      }

      return pass;
    }
    else {
      var intersectRect = getIntersectRect.apply(null, arguments);

      if (!assert(intersectRect, 'Invalid elements specified.')) return false;

      return (intersectRect.width * intersectRect.height !== 0);
    }
  }

  return hitTestElement;
});
