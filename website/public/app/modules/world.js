const worldModule = {
  init(VIA) {
    this.via = VIA;
    this.task = null;
    this.canvas = null;
  },

  mount(host, VIA) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 600;
    this.canvas.height = 300;

    host.innerHTML = '<section><h2>World Map</h2></section>';
    host.appendChild(this.canvas);

    const context = this.canvas.getContext('2d');
    let theta = 0;

    this.task = function worldAnimation() {
      theta += 0.015;
      context.clearRect(0, 0, 600, 300);
      context.fillStyle = '#081018';
      context.fillRect(0, 0, 600, 300);
      context.strokeStyle = '#2dd4bf';
      context.lineWidth = 2;
      context.beginPath();
      context.arc(300, 150, 100 + Math.sin(theta) * 8, 0, Math.PI * 2);
      context.stroke();
    };

    VIA.core.addTask(this.task);
  },

  destroy() {
    if (this.task && this.via) {
      this.via.core.removeTask(this.task);
    }

    this.task = null;
    this.canvas = null;
  }
};

export default worldModule;
