const academyModule = {
  init() {
    this.started = true;
  },

  mount(host) {
    host.innerHTML = '<section><h2>Logic Academy</h2><p>Lessons loaded with module lifecycle isolation.</p></section>';
  },

  destroy() {
    this.started = false;
  }
};

export default academyModule;
