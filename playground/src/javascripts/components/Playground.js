
'use strict';

let vars = require('vars');

class Playground extends vars.Element {
  init() {
    this.removeChild('a');
    super.init();
  }

  update() {
    super.update();
  }

  destroy() {

  }
}

module.exports = Playground;
