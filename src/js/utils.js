/**
 * VARS
 * (c) Andrew Wei
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Module of general-purpose utility methods/classes.
 *
 * @type {Module}
 */

'use strict';

define('utils', [
  'utils/debounce',
  'utils/inherit',
  'utils/namespace',
  'utils/ready'
], function(
  debounce,
  inherit,
  namespace,
  ready
) {
  var api = {};

  Object.defineProperty(api, 'debounce', { value: debounce, writable: false, enumerable: true });
  Object.defineProperty(api, 'inherit', { value: inherit, writable: false, enumerable: true });
  Object.defineProperty(api, 'namespace', { value: namespace, writable: false, enumerable: true });
  Object.defineProperty(api, 'ready', { value: ready, writable: false, enumerable: true });

  return api;
});
