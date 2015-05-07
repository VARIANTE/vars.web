/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define(
[
],
function
(
)
{

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If 'immediate' is passed, trigger the function on the
 * leading edge, instead of the trailing.
 * @param  {Boolean}    condition   Condition to validate against.
 * @param  {String}     message     (Optional) Message to be displayed when assertion fails.
 * @see  Underscore.js
 */
function debounce(func, wait, immediate)
{
    var timeout;

    return function()
    {
        var context = this, args = arguments;
        var later = function()
        {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

return debounce; });
