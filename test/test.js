/* globals vars:true */

(function()
{
    'use strict';

    // vars.debug = true;

    vars.namespace('test.controllers').A = (function()
    {
        function A()
        {
            A.__super__.constructor.apply(this, arguments);
        } vars.inherit(A, vars.Element);

        A.prototype.init = function()
        {
            // this.updateDelegate.responsive = true;
            this.updateDelegate.refreshRate = 10.0;
            this.updateDelegate.transmissive = vars.DirtyType.POSITION;

            console.log('I am', this.toString());

            document.addEventListener(vars.EventType.MOUSE.CLICK, function(event)
            {
                vars.debug = true;
                var vector = { x: event.clientX, y: event.clientY };
                var hitTest = vars.hitTestElement(vector, this.children.cs1, this.children.cs[0], this.children.cs[1]);
                console.log(hitTest);


            }.bind(this));

            A.__super__.init.call(this);
        };

        A.prototype.update = function()
        {
            A.__super__.update.call(this);
        };

        return A;
    }());

    vars.namespace('test.controllers').B = (function()
    {
        function B()
        {
            B.__super__.constructor.apply(this, arguments);
        } vars.inherit(B, vars.Element);

        B.prototype.init = function()
        {
            console.log('I am', this.toString());
            B.__super__.init.call(this);
        };

        return B;
    }());

    vars.namespace('test.controllers').C = (function()
    {
        function C()
        {
            C.__super__.constructor.apply(this, arguments);
        } vars.inherit(C, vars.Element);

        C.prototype.init = function()
        {
            this.updateDelegate.receptive = vars.DirtyType.POSITION;
            console.log('I am', this.toString());
            C.__super__.init.call(this);
        };

        C.prototype.update = function()
        {
            console.log('foo');
            C.__super__.update.call(this);
        };

        return C;
    }());

    vars.initDOM(vars.namespace('test'));
}());
