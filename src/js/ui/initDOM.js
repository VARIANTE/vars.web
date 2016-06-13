/**
 * VARS
 * (c) Andrew Wei
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */

'use strict';

define([
  'types/Directives',
  'ui/Element',
  'ui/Video',
  'ui/hasChild',
  'helpers/assert',
  'helpers/length',
  'utils/namespace',
  'utils/ready'
], function(
  Directives,
  Element,
  Video,
  hasChild,
  assert,
  length,
  namespace,
  ready
) {
  /**
   * Parses the entire DOM and transforms elements marked with VARS attributes
   * into instances of its corresponding controller class (or VARS Element by
   * by default).
   *
   * @param {Object} controllerScope
   */
  function initDOM(controllerScope) {
    ready(function() {
      getChildElements(document, controllerScope);
    });
  }

  /**
   * Transforms all the DOM elements inside the specified element marked with custom
   * VARS attributes into an instance of either its specified controller class or a generic
   * VARS Element. If a marked DOM element is a child of another marked DOM element, it will
   * be passed into the parent element's children tree as its specified controller
   * class instance or a generic VARS Element.
   *
   * @param {Object} element         HTMLElement, VARS Element, or jQuery object.
   * @param {Object} controllerScope
   */
  function getChildElements(element, controllerScope) {
    var children = null;

    if (!element) element = document;
    if (element.jquery) element = element.get(0);
    if (!assert((element instanceof HTMLElement) || (element instanceof Element) || (document && element === document), 'Element must be an instance of an HTMLElement or the DOM itself.')) return null;
    if (element instanceof Element) element = element.element;

    var nodeList = element.querySelectorAll('[' + Directives.Controller + '], [data-' + Directives.Controller + '], [' + Directives.Instance + '], [data-' + Directives.Instance + ']');
    var qualifiedChildren = filterParentElements(nodeList);
    var n = qualifiedChildren.length;

    for (var i = 0; i < n; i++) {
      var child = qualifiedChildren[i];
      var className = child.getAttribute(Directives.Controller) || child.getAttribute('data-' + Directives.Controller);
      var childName = child.getAttribute(Directives.Instance) || child.getAttribute('data-' + Directives.Instance);
      var controller = (className) ? namespace(className, controllerScope) : null;

      // If no controller class is specified but element is marked as an instance, default the controller class to
      // Element.
      if (!controller && length(childName) > 0) {
        controller = Element;
      }
      else if (typeof controller !== 'function') {
        switch (className) {
          case 'Video': {
            controller = Video;
            break;
          }
          case 'Element': {
            controller = Element;
            break;
          }
          default: {
            controller = null;
            break;
          }
        }
      }

      if (!assert(typeof controller === 'function', 'Class "' + className + '" is not found in specified controllerScope ' + (controllerScope || window) + '.')) continue;

      var m = new controller({
        element: child,
        name: childName,
        children: getChildElements(child, controllerScope)
      });

      if (length(childName) > 0) {
        if (!children) children = {};

        if (!children[childName]) {
          children[childName] = m;
        }
        else {
          if (children[childName] instanceof Array) {
            children[childName].push(m);
          }
          else {
            var a = [children[childName]];
            a.push(m);
            children[childName] = a;
          }
        }
      }
    }

    return children;
  }

  function filterParentElements(nodeList) {
    var n = nodeList.length;
    var o = [];

    for (var i = 0; i < n; i++) {
      var isParent = true;
      var child = nodeList[i];

      for (var j = 0; j < n; j++) {
        if (i === j) continue;

        var parent = nodeList[j];

        if (hasChild(parent, child)) {
          isParent = false;
          break;
        }
      }

      if (isParent) {
        o.push(child);
      }
    }

    return o;
  }

  return initDOM;
});
