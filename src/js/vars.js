/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Construction of the VARS API.
 */
define(
  [
    'enums',
    'events',
    'math',
    'ui',
    'utils'
  ],
  function(
    enums,
    events,
    math,
    ui,
    utils
  ) {
    var vars = function(obj) {
      return obj;
    };

    /**
     * Version.
     *
     * @type {String}
     */
    Object.defineProperty(vars, 'version', {
      value: '0.22.5',
      writable: false
    });

    /**
     * Inject the 'enums' module and all of its sub-modules into the main vars module.
     */
    inject('enums', enums);

    /**
     * Inject the 'events' module and all of its sub-modules into the main vars module.
     */
    inject('events', events);

    /**
     * Inject the 'math' module and all of its sub-modules into the main vars module.
     */
    inject('math', math);

    /**
     * Inject the 'ui' module and all of its sub-modules into the main vars module.
     */
    inject('ui', ui);

    /**
     * Inject the 'utils' module and all of its sub-modules into the main vars module.
     */
    inject('utils', utils);

    /**
     * @private
     *
     * Injects a module and all of its sub-modules into the main vars module.
     *
     * @param  {String} name   Name of the module (used as the key for the key-value pair in vars).
     * @param  {Object} module Module object (used as value for the key-value pair in VARS).
     */
    function inject(name, module) {
      Object.defineProperty(vars, name, {
        value: module,
        writable: false
      });

      for (var key in module) {
        if (module.hasOwnProperty(key)) {
          Object.defineProperty(vars, key, {
            value: module[key],
            writable: false
          });
        }
      }
    }

    return vars;
  }
);
