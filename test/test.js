/* globals vars:true */

(function() {
  'use strict';

  vars.namespace('test.controllers').A = (function() {
    function A() {
      A.__super__.constructor.apply(this, arguments);
    }
    vars.inherit(A, vars.Element);

    A.prototype.init = function() {
      this.addEventListener(vars.EventType.MOUSE.CLICK, this.foo.bind(this));

      var children = this.getChild('c.d.e.f');
      console.log(children);
      A.__super__.init.call(this);
    };

    A.prototype.update = function() {
      A.__super__.update.call(this);
    };

    A.prototype.foo = function(event) {

    };

    return A;
  }());

  vars.namespace('test.controllers').B = (function() {
    function B() {
      B.__super__.constructor.apply(this, arguments);
    }
    vars.inherit(B, vars.Element);

    B.prototype.init = function() {
      // console.log('I am', this.toString());
      B.__super__.init.call(this);
    };

    return B;
  }());

  vars.namespace('test.controllers').C = (function() {
    function C() {
      C.__super__.constructor.apply(this, arguments);
    }
    vars.inherit(C, vars.Element);

    C.prototype.init = function() {
      this.updateDelegate.receptive = vars.DirtyType.POSITION;
      // console.log('I am', this.toString());
      C.__super__.init.call(this);
    };

    C.prototype.update = function() {
      C.__super__.update.call(this);
    };

    return C;
  }());

  vars.initDOM(vars.namespace('test'));

  var foo = new vars.Element();
}());
