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
define([
    'enums/DirtyType',
    'enums/NodeState'
  ],
  function(
    DirtyType,
    NodeState
  ) {
    var api = function(obj) {
      return obj;
    };

    Object.defineProperty(api, 'DirtyType', { value: DirtyType, writable: false, enumerable: true });
    Object.defineProperty(api, 'NodeState', { value: NodeState, writable: false, enumerable: true });

    return api;
  }
);
