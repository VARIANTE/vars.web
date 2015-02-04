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

var sVideo;


/**
 * @import
 * Copy of the DirtyType enums.
 * @type {object}
 */
var DirtyType = vars.enums.DirtyType;

/**
 * @constructor
 * Creates a new Test instance.
 */
function Test(element)
{
    vars.ui.Element.call(this, element);
}

/**
 * Set up inheritance.
 */
var parent = vars.utils.inherit(Test, vars.ui.Element);

/**
 * @inheritDoc
 */
Test.prototype.init = function()
{
    this.responsive = true;

    sVideo = new vars.ui.Video();
    sVideo.source = [{ src:'assets/videos/preview.mp4'}];
    sVideo.loop = true;
    sVideo.autoplay = true;

    $('body').append(sVideo.element);

    parent.prototype.init.call(this);
};

/**
 * @inheritDoc
 */
Test.prototype.update = function(dirtyTypes)
{
    if (this.isDirty(DirtyType.POSITION))
    {

    }

    parent.prototype.update.call(this);
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
