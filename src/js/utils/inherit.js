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
     * Sets up prototypal inheritance between a child class and a parent class. This process
     * also creates a new prototype method hasProperty() for the child class which allows
     * verifying inherited properties (as opposed to the native hasOwnProperty() method).
     *
     * @param  {Object} child   Child class (function)
     * @param  {Object} parent  Parent class (function)
     *
     * @return {Object} Parent class (function).
     */
    function inherit(child, parent) {
      for (var key in parent) {
        if (parent.hasOwnProperty(key)) {
          child[key] = parent[key];
        }
      }

      function c() {
        this.constructor = child;
      }

      c.prototype = Object.create(parent.prototype);
      child.prototype = new c();
      child.__super__ = parent.prototype;
      return child;
    }

    return inherit;
  }
);
