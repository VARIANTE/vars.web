/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Module of global VARS enums.
 *
 * @type {Module}
 */

'use strict';

define([
    'enums/DirtyType',
    'enums/KeyCode',
    'enums/NodeState'
  ],
  function(
    DirtyType,
    KeyCode,
    NodeState
  ) {
    var api = function(obj) {
      return obj;
    };

    Object.defineProperty(api, 'DirtyType', { value: DirtyType, writable: false, enumerable: true });
    Object.defineProperty(api, 'KeyCode', { value: KeyCode, writable: false, enumerable: true });
    Object.defineProperty(api, 'NodeState', { value: NodeState, writable: false, enumerable: true });

    return api;
  }
);
