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
    'ui/getChildElements',
    'utils/ready'
  ],
  function(
    getChildElements,
    ready
  ) {
    /**
     * Parses the entire DOM and transforms elements marked with VARS attributes
     * into instances of its corresponding controller class (or VARS Element by
     * by default).
     *
     * @param  {Object} controllerScope
     */
    function initDOM(controllerScope) {
      ready(function() {
        getChildElements(document, controllerScope);
      });
    }

    return initDOM;
  }
);
