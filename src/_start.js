/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  Start file for r.js.
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
(function(root, factory, undefined)
{
    var vars = factory;

    // Check if using AMD.
    if (typeof module !== 'undefined' && module.exports)
    {
        module.exports = vars;
    }
    // Browser (?).
    else
    {
        vars.utils.namespace('io').variante = vars;
        root.vars = vars;
        root._ = vars;
    }
}((typeof window !== 'undefined') ? window : this, function() {