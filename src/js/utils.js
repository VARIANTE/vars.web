/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Module of utility methods/classes.
 *
 * @type {Module}
 */
define([
    'utils/debounce',
    'utils/inherit',
    'utils/isNull',
    'utils/keyOfValue',
    'utils/module',
    'utils/namespace',
    'utils/ready',
    'utils/sizeOf',
    'utils/AssetLoader'
  ],
  function(
    debounce,
    inherit,
    isNull,
    keyOfValue,
    module,
    namespace,
    ready,
    sizeOf,
    AssetLoader
  ) {
    var api = function(obj) {
      return obj;
    };

    Object.defineProperty(api, 'debounce', { value: debounce, writable: false, enumerable: true });
    Object.defineProperty(api, 'inherit', { value: inherit, writable: false, enumerable: true });
    Object.defineProperty(api, 'isNull', { value: isNull, writable: false, enumerable: true });
    Object.defineProperty(api, 'keyOfValue', { value: keyOfValue, writable: false, enumerable: true });
    Object.defineProperty(api, 'module', { value: module, writable: false, enumerable: true });
    Object.defineProperty(api, 'namespace', { value: namespace, writable: false, enumerable: true });
    Object.defineProperty(api, 'ready', { value: ready, writable: false, enumerable: true });
    Object.defineProperty(api, 'sizeOf', { value: sizeOf, writable: false, enumerable: true });
    Object.defineProperty(api, 'AssetLoader', { value: AssetLoader, writable: false, enumerable: true });


    return api;
  }
);
