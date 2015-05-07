/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Utilities.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    [
        'utils/assert',
        'utils/debounce',
        'utils/log',
        'utils/namespace',
        'utils/inherit',
        'utils/sizeof',
        'utils/keyofvalue',
        'utils/isnull',
        'utils/assetloader'
    ],
    function
    (
        assert,
        debounce,
        log,
        namespace,
        inherit,
        sizeOf,
        keyOfValue,
        isNull,
        AssetLoader
    )
    {
        var api = function(obj)
        {
            return obj;
        };

        Object.defineProperty(api, 'assert', { value: assert, writable: false, enumerable: true });
        Object.defineProperty(api, 'debounce', { value: debounce, writable: false, enumerable: true });
        Object.defineProperty(api, 'log', { value: log, writable: false, enumerable: true });
        Object.defineProperty(api, 'namespace', { value: namespace, writable: false, enumerable: true });
        Object.defineProperty(api, 'inherit', { value: inherit, writable: false, enumerable: true });
        Object.defineProperty(api, 'sizeOf', { value: sizeOf, writable: false, enumerable: true });
        Object.defineProperty(api, 'keyOfValue', { value: keyOfValue, writable: false, enumerable: true });
        Object.defineProperty(api, 'isNull', { value: isNull, writable: false, enumerable: true });
        Object.defineProperty(api, 'AssetLoader', { value: AssetLoader, writable: false, enumerable: true });

        return api;
    }
);
