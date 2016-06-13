/**
 * VARS
 * (c) Andrew Wei
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Start file for r.js.
 */
(function(root, factory, undefined) {
  'use strict';

  var vars = factory;

  // Check if using CommonJS.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = vars;
  }
  // Check if using AMD.
  else if (typeof define === 'function' && typeof define.amd === 'object') {
    define('vars', [], vars);
  }
  // Browser (?).
  else {
    root.vars = vars;
  }
}((typeof window !== 'undefined') ? window : this, function() {
