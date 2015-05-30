/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Module of methods/classes related to math.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    [
        'math/clamp'
    ],
    function
    (
        clamp
    )
    {
        var api = function(obj) { return obj; };

        Object.defineProperty(api, 'clamp', { value: clamp, writable: false, enumerable: true });

        return api;
    }
);
