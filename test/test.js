/**
 *  vars
 *  (c) VARIANTE (http://variante.io)
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */

/**
 * @class
 * Controller of the main module.
 */
vars.module((function() {

'use strict';

vars.debug = true;

console.log(vars.math.clamp);

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
    this.updateDelegate.refreshRate = 20.0;

    parent.prototype.init.call(this);
};

/**
 * @inheritDoc
 */
Test.prototype.update = function(dirtyTypes)
{
    if (this.isDirty(vars.DirtyType.POSITION))
    {
        var element = $('#foo');
        vars.translate(element, { top: 0 });
        vars.translate3d(element, { x: 50, y: 50 }, { x: 25 });
    }

    parent.prototype.update.call(this);
};

return Test; }()));
