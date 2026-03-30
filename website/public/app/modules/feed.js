export function mount(host, VIA) {
  const cards = VIA.storage.get('via:feed', [
    'Decision impulse #1',
    'Decision impulse #2',
    'Decision impulse #3'
  ]);

  host.innerHTML = `<section><h2>Swipe Feed</h2><ul>${cards.map((card) => `<li>${card}</li>`).join('')}</ul></section>`;
}
