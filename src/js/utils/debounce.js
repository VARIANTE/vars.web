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

define([],
  function() {
    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If 'immediate' is passed, trigger the function on the
     * leading edge, instead of the trailing.
     *
     * @param  {Function}   method      Method to be debounced.
     * @param  {Number}     delay       Debounce rate in milliseconds.
     * @param  {Boolean}    immediate   (Optional) Indicates whether the method is triggered
     *                                  on the leading edge instead of the trailing.
     *
     * @return {Function} The debounced method.
     */
    function debounce(method, delay, immediate) {
      var timeout;

      return function() {
        var context = this;
        var args = arguments;

        var later = function() {
          timeout = null;

          if (!immediate) {
            method.apply(context, args);
          }
        };

        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, delay);

        if (callNow) {
          method.apply(context, args);
        }
      };
    }

    return debounce;
  }
);
