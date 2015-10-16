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
     * Internal logger to console if debug mode is on.
     */
    function log() {
      if (window && window.VARS_DEBUG && window.console && console.log) {
        Function.apply.call(console.log, console, arguments);
      }
    }

    return log;
  }
);
