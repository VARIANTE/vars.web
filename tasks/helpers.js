/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Global helper functions for task runner.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
module.exports =
{
    /**
     * Gets an array of globbing patterns. Arguments must be in the form of either
     * array of object. If array is specified, that array will be used as the lookup for
     * supported file extensions. If object is specified, that object will be expected to
     * have at least a 'formats' key along with optional 'root' and 'exclude' keys.
     *
     * @return {Array} Array of globbing patterns with the arguments.
     */
    getPatterns: function()
    {
        var o = [];

        if (arguments.length > 0)
        {
            for (var i = 0; i < arguments.length; i++)
            {
                var option = arguments[i];
                var type = Object.prototype.toString.call(option);
                var root = '';
                var formats = null;
                var exclude = false;

                switch (type)
                {
                    case '[object Array]':
                    {
                        root = '';
                        formats = option;
                        exclude = false;
                        break;
                    }

                    case '[object Object]':
                    {
                        root = (!option.root || option.root === '') ? '' : option.root + '/';
                        formats = option.formats || [];
                        exclude = option.exclude;
                        break;
                    }

                    default:
                        continue;
                }

                if (formats)
                {
                     for (var j = 0; j < formats.length; j++)
                     {
                         var path = root + '**/*.' + formats[j];

                         if (exclude)
                         {
                             path = '!' + path;
                         }

                         o.push(path);
                     }
                }
            }
        }

        return o;
    }
};