/**
 *  vars.js
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
         * Creates a new module and attaches it to the window when DOM is ready. Option
         * to pass an init object to initialize the module. A typical use-case will be to
         * create a new Element module.
         *
         * @param  {Function}   impl Module implementation.
         * @param  {Object}     init Optional object passed into the impl.
         */
        function module(impl, init)
        {
            if (!document) return;

            var onLoaded = function(event)
            {
                if (document.addEventListener)
                {
                    document.removeEventListener('DOMContentLoaded', onLoaded, false);
                    window.removeEventListener('load', onLoaded, false);
                }
                else if (document.attachEvent)
                {
                    document.detachEvent('onreadystatechange', onLoaded);
                    window.detachEvent('onload', onLoaded);
                }

                setTimeout(initialize, 1);
            };

            var initialize = function()
            {
                var module = new impl(init);

                if (window && !window.module)
                {
                    window.module = module;
                }
            };

            if (document.readyState === 'complete')
            {
                return setTimeout(initialize, 1);
            }

            if (document.addEventListener)
            {
                document.addEventListener('DOMContentLoaded', onLoaded, false);
                window.addEventListener('load', onLoaded, false);
            }
            else if (document.attachEvent)
            {
                document.attachEvent('onreadystatechange', onLoaded);
                window.attachEvent('onload', onLoaded);
            }
        }

        return module;
    }
);