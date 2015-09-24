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
      this.removeClass('a');

      var c1 = this.getChild('c1');
      var c2_2 = this.getChild('c2')[1];

      A.__super__.init.call(this);
    };

    A.prototype.update = function() {
      console.log('bar', this.data.foo, this.data.bar, this.data.me);
      A.__super__.update.call(this);
    };

    A.prototype.foo = function(event) {
      this.data.foo--;
      this.data.bar++;
      this.data.me = !this.data.me;
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
