/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define([
    'ui/toElementArray',
    'utils/assert',
    'utils/sizeOf'
  ],
  function(
    toElementArray,
    assert,
    sizeOf
  ) {
    /**
     * Checks if specified parent contains specified child.
     *
     * @param  {Object} parent  HTMLElement, VARS Element, or jQuery object.
     * @param  {Object} child   HTMLElement, VARS Element, or jQuery object.
     *
     * @return {Boolean} True if parent has given child, false otherwise.
     */
    function hasChild(parent, child) {
      var ps = toElementArray(parent);
      var cs = toElementArray(child);

      if (!assert(sizeOf(ps) === 1, 'Invalid parent specified. Parent must be a single HTMLElement, VARS Element, or jQuery object.')) return false;
      if (!assert(sizeOf(cs) === 1, 'Invalid child specified. Child must be a single HTMLElement, VARS Element, or jQuery object.')) return false;
      if (!assert(document, 'Document not found. This method requires document to be valid.')) return false;

      var p = ps[0];
      var c = cs[0];

      if (!c.parentNode) return false;

      while (c !== null && c !== undefined && c !== document) {
        c = c.parentNode;

        if (c === p) return true;
      }

      return false;
    }

    return hasChild;
  }
);
