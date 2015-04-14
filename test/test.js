/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */

/**
 * @class
 * Controller of the main module.
 */
(function(global) { vars.utils.namespace('io.variante').Test = (function() {

'use strict';

vars.debug = true;

/**
 * @import
 * Copy of the DirtyType enums.
 * @type {Object}
 */
var DirtyType = vars.DirtyType;

/**
 * @import
 * Copy of the EventType object.
 * @type {Object}
 */
var EventType = vars.EventType;

/**
 * @constructor
 * Creates a new Test instance.
 */
function Test(element)
{
    vars.Element.call(this, element);
} var parent = vars.inherit(Test, vars.Element);

/**
 * @inheritDoc
 */
Test.prototype.init = function()
{
    this.responsive = true;

    parent.prototype.init.call(this);
};

/**
 * @inheritDoc
 */
Test.prototype.update = function(dirtyTypes)
{
    if (this.isDirty(DirtyType.POSITION))
    {
        var element = $('#foo');
        vars.translate(element, { top: 0 });
        vars.translate3d(element, { x: 50, y: 50 }, { x: 25 });
        console.log(element.css('transform'));
    }

    parent.prototype.update.call(this);
};

Test.prototype._onLoadComplete = function(event)
{
    console.log('DONE:', event.detail);
};

return Test; }());

/**
 * Ready DOM.
 */
document.addEventListener('DOMContentLoaded', function()
{
    window.main = new io.variante.Test();
});

}(window));
