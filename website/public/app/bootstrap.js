(function bootVIA(global) {
  'use strict';

  const VIA = global.VIA;
  if (!VIA || !VIA.router || !VIA.modules) {
    return;
  }

  function ensureRootContainer() {
    let root = document.querySelector('#via-app');
    if (root) {
      return root;
    }

    root = document.createElement('main');
    root.id = 'via-app';
    document.body.appendChild(root);
    return root;
  }

  document.addEventListener('DOMContentLoaded', function onReady() {
    ensureRootContainer();
    VIA.router.start();
  });
}(window));
