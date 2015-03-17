/**
 *  vars.js
 *  (c) VARIANTE (http://variante.io)
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */
define(['utils/assert', 'ui/getviewportrect'], function(assert, getViewportRect) {

/**
 * Gets the rect of a given element.
 * @param  {Object} element
 * @return {Object} Object containing top, left, bottom, right, width, height.
 */
function getRect(element)
{
    assert(element, 'Invalid element specified.');
    assert(window && document, 'Window or document undefined.');

    if (!element || !window || !document) return null;

    if (element === window) return getViewportRect();

    var fov = getViewportRect();
    var rect = {};

    rect.width  = (element.outerWidth) ? element.outerWidth() : element.getBoundingClientRect().width;
    rect.height = (element.outerHeight) ? element.outerHeight() : element.getBoundingClientRect().height;
    rect.top    = (element.offset) ? element.offset().top : element.getBoundingClientRect().top - fov.y;
    rect.left   = (element.offset) ? element.offset().left : element.getBoundingClientRect().left - fov.x;
    rect.bottom = rect.top + rect.height;
    rect.right  = rect.left + rect.width;

    return rect;
}

return getRect; });
