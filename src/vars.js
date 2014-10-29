/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Main library API.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    [
        'enums',
        'ui',
        'utils',
    ],
    function(enums, ui, utils)
    {
        var vars = function(obj)
        {
            return obj;
        };

        // Properties.
        vars.version = '0.1.0';

        // Members.
        vars.enums = enums;
        vars.ui    = ui;
        vars.utils = utils;

        return vars;
    }
);