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

vars.debug = false;

console.log(vars.math.clamp);

/**
 * @constructor
 * Creates a new Test instance.
 */
function Test(init)
{
    vars.Element.call(this, init || $('#foo').get(0));
} var parent = vars.inherit(Test, vars.Element);

/**
 * @inheritDoc
 */
Test.prototype.init = function()
{
    this.updateDelegate.responsive = true;
    this.updateDelegate.refreshRate = 20.0;

    parent.prototype.init.call(this);
};

/**
 * @inheritDoc
 */
Test.prototype.update = function(dirtyTypes)
{
    if (this.updateDelegate.isDirty(vars.DirtyType.POSITION))
    {
        vars.translate(this.element, { top: 0 });
        vars.translate3d(this.element, { x: 50, y: 50 }, { x: 25 });
    }

    parent.prototype.update.call(this);
};

return Test; }()));
