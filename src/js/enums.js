/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Module of global VARS enums.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    [
        'enums/DirtyType'
    ],
    function
    (
        DirtyType
    )
    {
        var api = function(obj) { return obj; };

        Object.defineProperty(api, 'DirtyType', { value: DirtyType, writable: false, enumerable: true });

        return api;
    }
);