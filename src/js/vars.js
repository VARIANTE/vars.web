/**
 * VARS
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Construction of the VARS API.
 */

'use strict';

define('vars', [
  'events',
  'math',
  'net',
  'types',
  'ui',
  'utils'
], function(
  events,
  math,
  net,
  types,
  ui,
  utils
) {
  var vars = {};

  Object.defineProperty(vars, 'name', { value: 'VARS', writable: false });
  Object.defineProperty(vars, 'version', { value: '1.2.0', writable: false });

  injectModule('events', events);
  injectModule('math', math);
  injectModule('net', net);
  injectModule('types', types);
  injectModule('ui', ui);
  injectModule('utils', utils);

  /**
   * @private
   *
   * Injects a module and all of its sub-modules into the core VARS module.
   *
   * @param {String} name    Name of the module (used as the key for the
   *                         key-value pair in VARS).
   * @param {Object} module  Module object (used as value for the key-value
   *                         pair in VARS).
   */
  function injectModule(name, module) {
    Object.defineProperty(vars, name, {
      value: module,
      writable: false
    });

    for (var key in module) {
      if (module.hasOwnProperty(key)) {
        Object.defineProperty(vars, key, {
          value: module[key],
          writable: false
        });
      }
    }
  }

  return vars;
});
