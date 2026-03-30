/**
 * engine.js
 * Controller marrying the DOM, Data Binders, and Three.js visualization.
 * Achieves 100% decoupling from React and node packaging.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Boot the pure Vanilla 3D Visualizer
  const visualizer = new PlantVisualizer('canvas-container');
  
  // Connect Terminal Logger Data Binder from shared/
  const logger = new window.TerminalLogger();
  const logToTerminal = (payload) => {
    logger.streamToUI('#status-terminal', payload);
  };

  logToTerminal({ system: 'Orchade Engine v2 (Pure Vanilla)', status: 'Success' });
  logToTerminal({ render: 'WebGL Matrix Initialized', status: 'Success' });

  // Bind UI Hooks
  document.getElementById('btn-water').addEventListener('click', () => {
    logToTerminal({ action: 'Watering Plant', status: 'Success' });
    visualizer.updateState({ 
      toolEffect: 'water', 
      progress: Math.min(1, visualizer.state.progress + 0.2) 
    });
  });

  document.getElementById('btn-next-stage').addEventListener('click', () => {
    const nextStage = visualizer.state.stageIndex + 1;
    logToTerminal({ action: `Evolution to Stage ${nextStage}`, status: 'Success' });
    visualizer.updateState({ stageIndex: nextStage, progress: 0.1 });
  });

  document.getElementById('btn-fire').addEventListener('click', () => {
    const isBurning = !visualizer.state.isBurning;
    const weather = isBurning ? 'heatwave' : 'clear';
    logToTerminal({ 
      anomaly: isBurning ? 'Heatwave/Burn Detected' : 'Atmosphere Stabilized', 
      status: isBurning ? 'Error' : 'Success' 
    });
    visualizer.updateState({ isBurning, weather });
  });

  document.getElementById('btn-pest').addEventListener('click', () => {
    logToTerminal({ event: 'Pest Swarm approach', status: 'Error' });
    visualizer.updateState({ hasPests: true });
    
    // Demonstrate the GlassModal Data Binder
    setTimeout(() => {
      if (window.GlassModal) {
        window.GlassModal.open(
          'CRITICAL: SWARM DETECTED', 
          '<p style="color:var(--color-burn-red); font-family:var(--font-mono)">A localized swarm is attacking the root structure. Immediate pesticide deployment required to preserve root strength.</p>',
          [
            { 
              label: 'Deploy Pesticide (Cost: 10)', 
              closes: true,
              onClick: () => {
                visualizer.updateState({ hasPests: false, toolEffect: 'pesticide' });
                logToTerminal({ action: 'Pests Eradicated', status: 'Success' });
              }
            },
            { label: 'Evacuate (Critical)', type: 'critical' }
          ]
        );
      }
    }, 1000);
  });

  document.getElementById('btn-weather').addEventListener('click', () => {
    const weathers = ['clear', 'rain', 'storm', 'fog'];
    const currentIdx = weathers.indexOf(visualizer.state.weather);
    const nextWeather = weathers[(currentIdx + 1) % weathers.length];
    logToTerminal({ climate: `Shifted to ${nextWeather}`, status: 'Success' });
    visualizer.updateState({ weather: nextWeather });
  });
});
