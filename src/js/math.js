/**
 * VARS
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Module of methods/classes related to math.
 *
 * @type {Module}
 */

'use strict';

define('math', [
  'math/clamp',
  'math/isClamped',
  'math/isEven',
  'math/isOdd'
], function(
  clamp,
  isClamped,
  isEven,
  isOdd
) {
  var api = {};

  Object.defineProperty(api, 'clamp', { value: clamp, writable: false, enumerable: true });
  Object.defineProperty(api, 'isClamped', { value: isClamped, writable: false, enumerable: true });
  Object.defineProperty(api, 'isEven', { value: isEven, writable: false, enumerable: true });
  Object.defineProperty(api, 'isOdd', { value: isOdd, writable: false, enumerable: true });

  return api;
});
