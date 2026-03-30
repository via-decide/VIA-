import Link from 'next/link';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const camera = document.getElementById('camera');
    const panels = document.querySelectorAll('.panel');
    const depthReadout = document.getElementById('depth-readout');
    const scrollProxy = document.getElementById('scroll-proxy');

    if (!camera || !depthReadout || !scrollProxy) return;

    let currentScroll = 0;
    const scrollMultiplier = 2;

    const onScroll = () => {
      currentScroll = window.scrollY;
    };

    panels.forEach((panel) => {
      const z = parseFloat(panel.getAttribute('data-z') || '0');
      panel.style.transform = `translate(-50%, -50%) translateZ(${z}px)`;
    });

    function update3DCamera() {
      const zTranslation = currentScroll * scrollMultiplier;
      camera.style.transform = `translateZ(${zTranslation}px)`;
      depthReadout.innerText = Math.round(zTranslation).toString().padStart(5, '0');

      panels.forEach(panel => {
        const pz = parseFloat(panel.getAttribute('data-z') || '0');
        const relativeZ = pz + zTranslation;

        if (relativeZ > 600 || relativeZ < -4000) {
          panel.style.opacity = '0';
          panel.style.pointerEvents = 'none';
          panel.style.visibility = 'hidden';
        } else {
          panel.style.opacity = '1';
          panel.style.pointerEvents = 'auto';
          panel.style.visibility = 'visible';
        }
      });

      requestAnimationFrame(update3DCamera);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update3DCamera();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: '#030508', color: '#e2e8f0' }}>
      <div id="scroll-proxy" style={{ height: '6000px' }} />
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 20, fontFamily: 'monospace' }}>
        DEPTH <span id="depth-readout">00000</span>
      </div>

      <main id="viewport" style={{ position: 'fixed', inset: 0, perspective: '1200px', overflow: 'hidden' }}>
        <div id="camera" style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>
          <section className="panel" data-z="0" style={panelStyle}>
            <div style={cardStyle}>
              <h1>Visual Logic. Autonomous Core.</h1>
              <p>Next.js spatial landing with corrected 3D panel visibility and pointer boundaries.</p>
              <Link href="/viadecide" className="btn btn-primary">Enter ViaDecide</Link>
            </div>
          </section>
          <section className="panel" data-z="-2500" style={panelStyle}>
            <div style={cardStyle}>
              <h2>Sector 01: ViaLogic Hub</h2>
              <p>Unified route to Vibecoder mapping and architecture tools.</p>
              <Link href="/logichub" className="btn btn-secondary">Open LogicHub</Link>
            </div>
          </section>
          <section className="panel" data-z="-5000" style={panelStyle}>
            <div style={cardStyle}>
              <h2>Sector 02: World</h2>
              <p>Spatial world entry point in the Next.js router.</p>
              <Link href="/world" className="btn btn-secondary">Explore World</Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

const panelStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '90vw',
  maxWidth: 900,
  transform: 'translate(-50%, -50%)',
  transition: 'opacity 0.3s',
  textAlign: 'center'
};

const cardStyle = {
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 24,
  padding: '2rem',
  background: 'rgba(18,21,28,0.8)',
  backdropFilter: 'blur(12px)'
};
