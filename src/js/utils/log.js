/**
 *  vars
 *  (c) VARIANTE (http://variante.io)
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define
(
    [
    ],
    function
    (
    )
    {
        /**
         * Logs to console if debug mode is on.
         */
        function log()
        {
            if (window && window.vars && window.vars.debug && window.console && console.log)
            {
                Function.apply.call(console.log, console, arguments);
            }
        }

        return log;
    }
);
