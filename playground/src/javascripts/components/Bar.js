let vars = require('vars');

class Bar extends vars.Element {
  init() {
    this.interval = setInterval(function() {
      console.log('foo');
    }, 5000);
    super.init();
  }

  destroy() {
    clearInterval(this.interval);
    super.destroy();
  }
}

module.exports = Bar;
