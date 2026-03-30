export function mount(host, VIA) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 300;
  host.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let t = 0;

  function render() {
    t += 0.015;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#081018';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(300, 150, 100 + Math.sin(t) * 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  const task = function task() {
    render();
  };

  VIA.engine.loop.add(task);

  const observer = new MutationObserver(function onMutate() {
    if (!document.body.contains(host)) {
      VIA.engine.loop.remove(task);
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
