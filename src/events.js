/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Module of methods/classes related to the native event system.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    [
        'events/EventDispatcher',
        'events/EventType'
    ],
    function
    (
        EventDispatcher,
        EventType
    )
    {
        var api = function(obj) { return obj; };

        Object.defineProperty(api, 'EventDispatcher', { value: EventDispatcher, writable: false, enumerable: true });
        Object.defineProperty(api, 'EventType', { value: EventType, writable: false, enumerable: true });

        return api;
    }
);
