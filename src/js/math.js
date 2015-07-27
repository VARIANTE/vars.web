/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Module of methods/classes related to math.
 *
 * @type {Module}
 */
define
(
    [
        'math/clamp',
        'math/isClamped'
    ],
    function
    (
        clamp,
        isClamped
    )
    {
        var api = function(obj) { return obj; };

        Object.defineProperty(api, 'clamp', { value: clamp, writable: false, enumerable: true });
        Object.defineProperty(api, 'isClamped', { value: isClamped, writable: false, enumerable: true });

        return api;
    }
);
