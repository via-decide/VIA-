document.addEventListener('DOMContentLoaded', () => {
    const scrollWrapper = document.getElementById('scroll-wrapper');
    const mainGlow = document.getElementById('main-glow');
    const particleCanvas = document.getElementById('particle-canvas');
    const frames = document.querySelectorAll('.frame');

    // 1. PARTICLE TRAIL EFFECT
    const createParticle = (x, y) => {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 3 + 1;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        p.style.background = '#ff671f';
        p.style.position = 'absolute';
        p.style.borderRadius = '50%';
        p.style.opacity = '0.6';
        p.style.pointerEvents = 'none';
        p.style.filter = 'blur(1px)';
        p.style.boxShadow = '0 0 10px #ff671f';
        particleCanvas.appendChild(p);

        const duration = Math.random() * 2000 + 1000;
        const xOffset = (Math.random() - 0.5) * 40;
        
        p.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 0.8 },
            { transform: `translate(${xOffset}px, -300px) scale(0)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)'
        }).onfinish = () => p.remove();
    };

    // Spawn particles on scroll
    let lastScrollY = 0;
    scrollWrapper.addEventListener('scroll', () => {
        const currentScrollY = scrollWrapper.scrollTop;
        if (Math.abs(currentScrollY - lastScrollY) > 5) {
            for (let i = 0; i < 3; i++) {
                const x = Math.random() * window.innerWidth;
                const y = window.innerHeight - 20;
                createParticle(x, y);
            }
            lastScrollY = currentScrollY;
        }

        // AMBIENT GLOW MOVEMENT
        const scrollPct = currentScrollY / (scrollWrapper.scrollHeight - window.innerHeight);
        const yPos = scrollPct * 100;
        const xPos = 50 + Math.sin(scrollPct * Math.PI * 2) * 20;
        mainGlow.style.transform = `translate(${xPos}vw, ${yPos}vh)`;
    });

    // 2. SCROLL ZOOM EFFECT FOR FRAME 2
    const zoomCard = document.getElementById('zoom-card');
    const frame2 = document.getElementById('frame-2');
    
    scrollWrapper.addEventListener('scroll', () => {
        const frame2Rect = frame2.getBoundingClientRect();
        const winHeight = window.innerHeight;
        
        // When Frame 2 starts coming into view
        if (frame2Rect.top < winHeight && frame2Rect.bottom > 0) {
            const progress = (winHeight - frame2Rect.top) / winHeight;
            // Map progress to scale 1.0 -> 1.8
            const scale = 1 + (progress * 0.8);
            if (scale < 1.8) {
              zoomCard.style.transform = `scale(${scale})`;
            }
        }
    });

    // 3. ENTRANCE ANIMATIONS (INTERSECTION OBSERVER)
    const observerOptions = {
        threshold: 0.5
    };

    const frameObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Active Nav State
                const navId = entry.target.id.split('-')[1];
                updateActiveNav(navId);
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

    frames.forEach(frame => frameObserver.observe(frame));

    const updateActiveNav = (frameId) => {
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach((tab, index) => {
            if (index + 1 === parseInt(frameId)) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    };

    // 4. TOUCH ENHANCEMENTS
    document.querySelectorAll('.cta-button').forEach(btn => {
        btn.addEventListener('touchstart', () => {
            btn.style.transform = 'scale(0.95)';
        });
        btn.addEventListener('touchend', () => {
            btn.style.transform = 'scale(1)';
        });
    });

});
