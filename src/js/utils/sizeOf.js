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
     * Gets the number of keys in a given object.
     *
     * @param  {*} object   Any object type.
     *
     * @return {Number} Size of specified object (depending on the object type,
     *                  it can be the number of keys in a plain object, number
     *                  of elements in an array, number of characters in a
     *                  string, number of digits in a number, and 0 for all
     *                  other types.
     */
    function sizeOf(object) {
      if (object === undefined || object === null) return 0;

      // If object internally has length property, use it.
      if (object.length !== undefined) return object.length;

      var size = 0;

      switch (typeof object) {
        case 'object': {
          if (object !== null && object !== undefined) {
            for (var k in object) size++;
          }

          break;
        }

        case 'number': {
          size = ('' + object).length;
          break;
        }

        default: {
          size = 0;
          break;
        }
      }

      return size;
    }

    return sizeOf;
  }
);
