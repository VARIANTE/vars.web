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
var DirtyType = _.DirtyType;

/**
 * @import
 * Copy of the EventType object.
 * @type {Object}
 */
var EventType = _.EventType;

/**
 * @constructor
 * Creates a new Test instance.
 */
function Test(element)
{
    _.Element.call(this, element);
} var parent = _.inherit(Test, _.Element);

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
        _.translate3D(element, { x: 50 });
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
