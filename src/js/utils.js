/**
 *  vars
 *  (c) VARIANTE (http://variante.io)
 *
 *  Module of utility methods/classes.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    [
        'utils/assert',
        'utils/changeElementState',
        'utils/debounce',
        'utils/log',
        'utils/namespace',
        'utils/inherit',
        'utils/sizeOf',
        'utils/module',
        'utils/keyOfValue',
        'utils/isNull',
        'utils/AssetLoader'
    ],
    function
    (
        assert,
        changeElementState,
        debounce,
        log,
        namespace,
        inherit,
        sizeOf,
        module,
        keyOfValue,
        isNull,
        AssetLoader
    )
    {
        var api = function(obj) { return obj; };

        Object.defineProperty(api, 'assert', { value: assert, writable: false, enumerable: true });
        Object.defineProperty(api, 'changeElementState', { value: changeElementState, writable: false, enumerable: true });
        Object.defineProperty(api, 'debounce', { value: debounce, writable: false, enumerable: true });
        Object.defineProperty(api, 'log', { value: log, writable: false, enumerable: true });
        Object.defineProperty(api, 'namespace', { value: namespace, writable: false, enumerable: true });
        Object.defineProperty(api, 'inherit', { value: inherit, writable: false, enumerable: true });
        Object.defineProperty(api, 'sizeOf', { value: sizeOf, writable: false, enumerable: true });
        Object.defineProperty(api, 'module', { value: module, writable: false, enumerable: true });
        Object.defineProperty(api, 'keyOfValue', { value: keyOfValue, writable: false, enumerable: true });
        Object.defineProperty(api, 'isNull', { value: isNull, writable: false, enumerable: true });
        Object.defineProperty(api, 'AssetLoader', { value: AssetLoader, writable: false, enumerable: true });

        return api;
    }
);
