/**
 * plant-visualizer.js
 * Pure Vanilla JS WebGL orchestration wrapper bypassing React architecture.
 */

class PlantVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) throw new Error("PlantVisualizer container not found.");

    // Init Scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 2, 6);
    this.camera.lookAt(0, 1, 0);

    // Init Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    // Setup Mesh Tracking
    this.plantGroup = null;
    this.weatherParticles = null;
    this.pestParticles = null;
    this.pestMeshes = null;
    this.burningParticles = null;
    this.toolParticles = null;

    // Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.dirLight.position.set(5, 10, 7.5);
    this.scene.add(this.dirLight);

    // Ground
    const soilMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.5, 0.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x3E2723, roughness: 0.8 })
    );
    soilMesh.position.y = -0.1;
    this.scene.add(soilMesh);

    // Simulation State Defaults
    this.state = {
      progress: 0,
      stageIndex: 1,
      type: 'Basic',
      color: '#4CAF50',
      isBurning: false,
      hasPests: false,
      stress: 0,
      weather: 'clear',
      toolEffect: null
    };

    this.time = 0;
    this.lastLightningTime = 0;
    this.lightningIntensity = 0;

    // Bind Event Handlers
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    // Boot Math
    this.updateModel();
    this.updateWeather();
    
    // Boot Loop
    this.animate = this.animate.bind(this);
    this.frameId = requestAnimationFrame(this.animate);
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  updateState(newState) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...newState };

    if (oldState.stageIndex !== this.state.stageIndex || oldState.type !== this.state.type) {
      this.updateModel();
    }

    if (oldState.weather !== this.state.weather) {
      this.updateWeather();
    }

    if (oldState.isBurning !== this.state.isBurning || oldState.hasPests !== this.state.hasPests) {
      this.updateStatusParticles();
    }

    if (newState.toolEffect) {
      this.createToolParticles(newState.toolEffect);
    }
  }

  updateModel() {
    if (this.plantGroup) {
      this.scene.remove(this.plantGroup);
    }
    this.plantGroup = this.createPlantModel(this.state.stageIndex, this.state.progress, this.state.type, this.state.color);
    this.scene.add(this.plantGroup);
  }

  createPlantModel(index, progress, type, plantColor) {
    const group = new THREE.Group();
    const leafColor = new THREE.Color(plantColor);
    
    const hsl = { h: 0, s: 0, l: 0 };
    leafColor.getHSL(hsl);
    leafColor.setHSL(hsl.h, hsl.s, hsl.l + (progress * 0.1));

    const stemThickness = (0.05 + (index * 0.03)) * (1 + progress * 0.5);
    const stemHeight = (0.6 + (index * 0.4)) * (1 + progress * 0.2);

    let trunkColor = 0x795548;
    if (type === 'Neon-Vine') trunkColor = 0x1B5E20;
    if (type === 'Quartz-Fern') trunkColor = 0x90A4AE;

    if (index === 0) {
      const geometry = new THREE.SphereGeometry(0.3, 16, 16);
      const material = new THREE.MeshStandardMaterial({ color: trunkColor });
      const seed = new THREE.Mesh(geometry, material);
      seed.name = 'stem';
      seed.scale.y = 0.8;
      seed.position.y = 0.2 + (progress * 0.1);
      group.add(seed);
    } else {
      const trunkRadiusTop = stemThickness;
      const trunkRadiusBottom = trunkRadiusTop * 1.5;
      const trunkGeom = new THREE.CylinderGeometry(trunkRadiusTop, trunkRadiusBottom, stemHeight, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: trunkColor });
      const trunk = new THREE.Mesh(trunkGeom, trunkMat);
      trunk.name = 'stem';
      trunk.position.y = stemHeight / 2;
      group.add(trunk);

      const leafMat = new THREE.MeshStandardMaterial({ 
        color: leafColor,
        transparent: true,
        opacity: 0.9
      });

      const leafCount = (index * 2) + 2;
      for (let i = 0; i < leafCount; i++) {
        const leafGeom = new THREE.SphereGeometry(0.2 * (1 + progress * 0.5), 8, 8);
        const leaf = new THREE.Mesh(leafGeom, leafMat);
        leaf.name = 'leaf';
        const angle = (i / leafCount) * Math.PI * 2;
        const dist = trunkRadiusTop + (0.1 * index);
        
        leaf.position.set(Math.cos(angle) * dist, (stemHeight * 0.6) + (Math.random() * stemHeight * 0.4), Math.sin(angle) * dist);
        leaf.scale.set(1, 0.3, 1);
        leaf.rotation.z = angle;
        
        leaf.userData.originalRotation = leaf.rotation.clone();
        leaf.userData.originalPosition = leaf.position.clone();
        group.add(leaf);
      }
    }

    const scale = 1 + progress * 0.3;
    group.scale.set(scale, scale, scale);
    return group;
  }

  updateWeather() {
    if (this.weatherParticles) {
      this.scene.remove(this.weatherParticles);
      this.weatherParticles.geometry.dispose();
      this.weatherParticles.material.dispose();
      this.weatherParticles = null;
    }
    this.scene.fog = null;
    this.scene.background = null;

    const type = this.state.weather;
    if (type === 'rain' || type === 'storm') {
      const count = type === 'storm' ? 3000 : 1000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 10;
        positions[i + 1] = Math.random() * 10;
        positions[i + 2] = (Math.random() - 0.5) * 10;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({ color: 0x81D4FA, size: 0.05, transparent: true, opacity: 0.6 });
      const points = new THREE.Points(geometry, material);
      this.scene.add(points);
      this.weatherParticles = points;
      this.scene.background = new THREE.Color(type === 'storm' ? 0x1A1A1A : 0x2A2A2A);
    }
  }

  updateStatusParticles() {
    if (this.burningParticles) {
      this.scene.remove(this.burningParticles);
      this.burningParticles.geometry.dispose();
      this.burningParticles.material.dispose();
      this.burningParticles = null;
    }

    if (this.state.isBurning) {
      const count = 150;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 1.2;
        positions[i + 1] = Math.random() * 2.5;
        positions[i + 2] = (Math.random() - 0.5) * 1.2;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color: 0xFF4500, size: 0.08, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending
      });
      const points = new THREE.Points(geometry, material);
      this.scene.add(points);
      this.burningParticles = points;
    }
  }

  createToolParticles(effect) {
    if (this.toolParticles) {
      this.scene.remove(this.toolParticles);
      this.toolParticles.geometry.dispose();
      this.toolParticles.material.dispose();
    }

    let count = 500;
    let color = effect === 'water' ? 0x00B0FF : 0x00E676;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2;
      positions[i + 1] = 4 + Math.random() * 2;
      positions[i + 2] = (Math.random() - 0.5) * 2;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color, size: 0.1, transparent: true, opacity: 0.8 });
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    this.toolParticles = points;
  }

  animate() {
    this.frameId = requestAnimationFrame(this.animate);
    this.time += 0.01;

    if (this.plantGroup) {
      this.plantGroup.rotation.y += 0.015;
      const sway = Math.sin(this.time * 1.5) * 0.02;
      this.plantGroup.rotation.z = sway;

      this.plantGroup.traverse((child) => {
        if (child.name === 'leaf' && child.userData.originalRotation) {
          child.rotation.x = child.userData.originalRotation.x + Math.sin(this.time * 2) * 0.05;
        }
      });
    }

    if (this.weatherParticles && this.state.weather !== 'clear') {
      const positions = this.weatherParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.15;
        if (positions[i + 1] < 0) {
          positions[i + 1] = 10;
          positions[i] = (Math.random() - 0.5) * 10;
          positions[i + 2] = (Math.random() - 0.5) * 10;
        }
      }
      this.weatherParticles.geometry.attributes.position.needsUpdate = true;
    }

    if (this.burningParticles) {
      const positions = this.burningParticles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.03;
        if (positions[i] > 3) positions[i] = 0;
      }
      this.burningParticles.geometry.attributes.position.needsUpdate = true;
      
      this.dirLight.color.setHex(0xFF5252);
    } else {
      if (this.state.weather === 'rain') this.dirLight.color.setHex(0x90CAF9);
      else this.dirLight.color.setHex(0xffffff);
    }

    if (this.toolParticles) {
      const positions = this.toolParticles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.1;
      }
      this.toolParticles.geometry.attributes.position.needsUpdate = true;
      
      if (this.toolParticles.material.opacity > 0) {
        this.toolParticles.material.opacity -= 0.01;
      } else {
        this.scene.remove(this.toolParticles);
        this.toolParticles = null;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.PlantVisualizer = PlantVisualizer;
