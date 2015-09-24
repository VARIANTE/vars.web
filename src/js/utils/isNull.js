/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define([],
  function() {
    /**
     * Checks if a given object is equal to null (type-insensitive).
     *
     * @param  {Object} object
     *
     * @return {Boolean}
     */
    function isNull(object) {
      if (object === undefined || object === null) {
        return true;
      }
      else {
        return false;
      }
    }

    return isNull;
  }
);
