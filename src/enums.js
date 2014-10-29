/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Library enums.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    [
        'enums/dirtytype'
    ],
    function(dirtytype)
    {
        var api = function(obj)
        {
            return obj;
        };

        api.DirtyType = dirtytype;

        return api;
    }
);