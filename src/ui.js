/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  UI classes.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    [
        'ui/viewcontroller'
    ],
    function(viewcontroller)
    {
        var api = function(obj)
        {
            return obj;
        };

        api.ViewController = viewcontroller;

        return api;
    }
);