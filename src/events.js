/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Event classes.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    [
        'events/eventdispatcher',
        'events/eventtype'
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
