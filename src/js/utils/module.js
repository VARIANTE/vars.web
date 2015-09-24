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
    'utils/ready'
  ],
  function(
    ready
  ) {
    /**
     * Creates a new module and attaches it to the window when DOM is ready. Option
     * to pass an init object to initialize the module. A typical use-case will be to
     * create a new Element module.
     *
     * @param  {Function}   impl Module implementation.
     * @param  {Object}     init Optional object passed into the impl.
     */
    function module(impl, init) {
      ready(function() {
        return new impl(init);
      });
    }

    return module;
  }
);
