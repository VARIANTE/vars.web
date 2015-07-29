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
            console.log('I am', this.toString());
            document.addEventListener(vars.EventType.MOUSE.CLICK, function(event)
            {
                if (vars.sizeOf(this.children) > 0)
                {
                    // var r = vars.getIntersectRect([this.children.C1, this.children.C2], this.children.C3);
                    // var t = vars.translate([this.children.C1, this.children.C3], { left: 20, top: 50});

                    vars.changeElementState([this.children.C1, this.children.C2], 'foo');
                }
            }.bind(this));

            A.__super__.init.call(this);
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
        } vars.inherit(C, vars.namespace('test.controllers').A);

        C.prototype.init = function()
        {
            C.__super__.init.call(this);
        };

        C.prototype.toString = function()
        {
            var s = C.__super__.toString.call(this);

            return s + ' of A';
        };

        return C;
    }());

    vars.initDOM(vars.namespace('test'));
}());
