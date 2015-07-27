/* global:vars */

(function() {
    'use strict';

    // vars.debug = true;

    var a = {};

    a.Foo = function(init)
    {
        a.Foo.__super__.constructor.apply(this, arguments);
    }; vars.inherit(a.Foo, vars.Element);


    a.Bar = function(init)
    {
        a.Bar.__super__.constructor.apply(this, arguments);
    }; vars.inherit(a.Bar, vars.Element);

    a.Foo.prototype.init = function()
    {
        a.Foo.__super__.init.call(this);
    };

    vars.initDOM(a);
}());
