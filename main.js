/**
 * main.js - Core UI Orchestration
 * Handles view switching, world app launching, and PWA logic.
 */

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-link');
  const views = {
    logichub: document.getElementById('logichub-view'),
    world: document.getElementById('world-view')
  };

  const overlay = document.getElementById('world-viewport-overlay');
  const iframe = document.getElementById('world-iframe');
  const title = document.getElementById('viewport-title');
  const closeBtn = document.getElementById('btn-close-viewport');

  // VIEW SWITCHING
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const viewId = tab.dataset.view;
      Object.keys(views).forEach(key => {
        if (key === viewId) {
          views[key].style.display = (key === 'logichub') ? 'grid' : 'grid';
          views[key].classList.add('active');
        } else {
          views[key].style.display = 'none';
          views[key].classList.remove('active');
        }
      });
    });
  });

  // WORLD APP LAUNCHING
  const appPaths = {
    alchemist: 'apps/alchemist/index.html',
    skillhex: 'apps/skillhex/index.html',
    viaco: 'apps/viaco/index.html',
    mars: 'apps/mars/index.html'
  };

  document.querySelectorAll('.world-card').forEach(card => {
    card.onclick = () => {
      const appId = card.dataset.app;
      const path = appPaths[appId];
      const appName = card.querySelector('h3').textContent;

      title.textContent = `${appName.toUpperCase()} // PRODUCTION_READY`;
      iframe.src = path;
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };
  });

  closeBtn.onclick = () => {
    overlay.classList.remove('active');
    iframe.src = 'about:blank';
    document.body.style.overflow = '';
  };

  // PWA INSTALLATION LOGIC
  let deferredPrompt;
  const installBtn = document.getElementById('btn-install-os');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
       installBtn.style.display = 'block';
       installBtn.style.opacity = '1';
    }
  });

  if (installBtn) {
    installBtn.onclick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          installBtn.innerHTML = 'SYSTEM INSTALLED';
          installBtn.style.background = '#00ff88';
        }
        deferredPrompt = null;
      } else {
        alert("PWA install not ready. On iPhone, tap 'Share' then 'Add to Home Screen'.");
      }
    };
  }

  if (window.matchMedia('(display-mode: standalone)').matches) {
    if (installBtn) installBtn.style.display = 'none';
  }

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      console.log('SW Registered:', reg.scope);
    });
  }
});
