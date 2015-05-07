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
 * Asserts the specified condition and throws a warning if assertion fails.
 * @param  {Boolean}    condition   Condition to validate against.
 * @param  {String}     message     (Optional) Message to be displayed when assertion fails.
 */
function assert(condition, message)
{
    if (!condition && (window && window.vars && window.vars.debug))
    {
        throw message || '[vars]: Assertion failed.';
    }
}

return assert; });
