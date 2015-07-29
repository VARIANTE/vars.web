/**
 * vars
 * (c) VARIANTE (http://variante.io)
 *
 * This software is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @type {Function}
 */
define
(
    [
        'ui/Directives',
        'ui/Element',
        'ui/Video',
        'utils/assert',
        'utils/namespace',
        'utils/ready',
        'utils/sizeOf'
    ],
    function
    (
        Directives,
        Element,
        Video,
        assert,
        namespace,
        ready,
        sizeOf
    )
    {
        /**
         * Transforms all the DOM elements inside the specified element marked with custom
         * VARS attributes into an instance of either its specified controller class or a generic
         * VARS Element. If a marked DOM element is a child of another marked DOM element, it will
         * be passed into the parent element's children tree as its specified controller
         * class instance or a generic VARS Element.
         *
         * @param  {Object} element         HTMLElement, VARS Element, or jQuery object.
         * @param  {Object} controllerScope
         */
        function getChildElements(element, controllerScope)
        {
            var children = null;

            if (!element) element = document;
            if (element.jquery) element = element.get(0);
            if (!assert((element instanceof HTMLElement) || (element instanceof Element) || (document && element === document), 'Element must be an instance of an HTMLElement or the DOM itself.')) return null;
            if (element instanceof Element) element = element.element;

            var qualifiedChildren = element.querySelectorAll('['+Directives.Controller+'], [data-'+Directives.Controller+'], ['+Directives.Instance+'], [data-'+Directives.Instance+']');
            var n = sizeOf(qualifiedChildren);

            for (var i = 0; i < n; i++)
            {
                var child = qualifiedChildren[i];
                var className = child.getAttribute(Directives.Controller) || child.getAttribute('data-'+Directives.Controller);
                var childName = child.getAttribute(Directives.Instance) || child.getAttribute('data-'+Directives.Instance);
                var controller = (className) ? namespace(className, controllerScope) : null;

                // If no controller class is specified but element is marked as an  instance, default the controller class to
                // Element.
                if (!controller && sizeOf(childName) > 0)
                {
                    controller = Element;
                }
                else if (typeof controller !== 'function')
                {
                    switch (className)
                    {
                        case 'Video':   { controller = Video; break; }
                        case 'Element': { controller = Element; break; }
                        default:        { controller = null; break; }
                    }
                }

                // Check if discovered child is also an immediate child of another discovered
                // child.
                var ignore = false;

                for (var j = 0; j < n; j++)
                {
                    if (j === i) continue;

                    var parent = qualifiedChildren[j];

                    if (parent.contains && parent.contains(child))
                    {
                        ignore = true;
                        break;
                    }
                }

                if (ignore) continue;

                if (!assert(typeof controller === 'function', 'Class "' + className + '" is not found in specified controllerScope ' + (controllerScope || window) + '.')) continue;

                var m = new controller({ element: child, name: childName, children: getChildElements(child, controllerScope) });

                if (sizeOf(childName) > 0)
                {
                    if (!children)
                    {
                        children = {};
                    }

                    if (!assert(!children[childName], 'Repeated child name "'+childName+'".')) continue;

                    children[childName] = m;
                }
            }

            return children;
        }

        return getChildElements;
    }
);
