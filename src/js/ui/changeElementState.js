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
  'types/Directives',
  'ui/getElementState',
  'ui/toElementArray',
  'ui/Element',
  'helpers/assert'
], function(
  Directives,
  getElementState,
  toElementArray,
  Element,
  assert
) {
  /**
   * Changes the state of DOM element(s), assumes that state classes are
   * prefixed with 'state-'.
   *
   * @param {*}      element  HTMLElement, VARS Element, or jQuery object.
   * @param {String} state
   */
  function changeElementState(element, state) {
    var elements = toElementArray(element, true);
    var n = elements.length;

    for (var i = 0; i < n; i++) {
      var e = elements[i];

      if (getElementState(e) === state) continue;

      if (e instanceof Element) {
        e.state = state;
      }
      else {
        e.setAttribute('data-' + Directives.State, state);
      }
    }
  }

  return changeElementState;
});
