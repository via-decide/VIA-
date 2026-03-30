const feedModule = {
  init(VIA) {
    this.via = VIA;
  },

  mount(host, VIA) {
    const cards = VIA.storage.get('via:feed', [
      'Decision impulse #1',
      'Decision impulse #2',
      'Decision impulse #3'
    ]);

    host.innerHTML = `<section><h2>Feed</h2><ul>${cards.map((card) => `<li>${card}</li>`).join('')}</ul></section>`;
  },

  destroy() {
    return null;
  }
};

export default feedModule;
