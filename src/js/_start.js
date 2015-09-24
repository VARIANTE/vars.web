/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Start file for r.js.
 */
(function(root, factory, undefined) {
  var vars = factory;

  // Check if using AMD.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = vars;
  }
  // Browser (?).
  else {
    root.vars = vars;
  }
}((typeof window !== 'undefined') ? window : this, function() {
