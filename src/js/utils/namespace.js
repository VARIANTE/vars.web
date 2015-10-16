/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */

'use strict';

define([
    'utils/assert'
  ],
  function(
    assert
  ) {
    /**
     * Creates the specified namespace in the specified scope.
     *
     * @param  {String} identifiers Namespace identifiers with parts separated by dots.
     * @param  {Object} scope       (Optional) Object to create namespace in (defaults to window).
     *
     * @return {Object} Reference tothe created namespace.
     */
    function namespace(identifiers, scope) {
      if (!assert(typeof identifiers === 'string', 'Invalid identifiers specified.')) return null;
      if (!assert(typeof scope === 'undefined' || typeof scope === 'object', 'Invalid scope specified.')) return null;

      var groups = identifiers.split('.');
      var currentScope = (scope === undefined || scope === null) ? window : scope;

      for (var i = 0; i < groups.length; i++) {
        currentScope = currentScope[groups[i]] || (currentScope[groups[i]] = {});
      }

      return currentScope;
    }

    return namespace;
  }
);
