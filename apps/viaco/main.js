/**
 * main.js - VIADECIDE // LOGICHUB
 * PWA Gateway Wiring for the Spatial OS
 */

let deferredPrompt;

// 1. REGISTER SERVICE WORKER
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((registration) => {
      console.log('SW Registered with scope:', registration.scope);
    });
  });
}

// 2. LISTEN FOR INSTALL PROMPT
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent default mini-infobar
  e.preventDefault();
  // Stash the event
  deferredPrompt = e;
  
  // Show all install buttons
  const installBtns = document.querySelectorAll('#btn-install-os');
  installBtns.forEach(btn => {
    btn.style.display = 'inline-block';
    btn.innerHTML = 'INSTALL VIA OS';
  });
});

// 3. INSTALL EVENT HANDLER
document.addEventListener('click', async (e) => {
  if (e.target && e.target.id === 'btn-install-os') {
    if (deferredPrompt) {
      // Show the native prompt
      deferredPrompt.prompt();
      
      // Wait for the user's choice
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the VIA OS install');
      } else {
        console.log('User dismissed the VIA OS install');
      }
      
      // Clear the stashed event
      deferredPrompt = null;
    } else {
      // Fallback info for iOS / Desktop where prompt might not fire
      alert("PWA install not ready. On iPhone, tap 'Share' then 'Add to Home Screen'.");
    }
  }
});

// 4. AFTER INSTALLATION CLEANUP
window.addEventListener('appinstalled', (event) => {
  console.log('VIA OS installed successfully');
  const installBtns = document.querySelectorAll('#btn-install-os');
  installBtns.forEach(btn => {
    btn.innerHTML = 'SYSTEM INSTALLED';
    btn.style.background = '#00ff88'; // Matrix Green
    btn.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.4)';
    btn.style.color = '#000';
  });
});

// 5. HUD COMPONENT ANIMATIONS (Simple scroll entrance)
const observerOptions = {
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.hub-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'all 0.5s ease-out';
  observer.observe(card);
});
