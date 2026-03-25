/* map-engine.js — Kutch City Urban Explorer */
(function(global) {
  'use strict';

  // --- CONFIG ---
  const WORLD_SIZE = 4000;
  const GRID_SIZE = 100;
  const PLAYER_SIZE = 24;
  const COLORS = {
    bg: '#121212',
    road: '#1e1e1e',
    grid: '#252528',
    player: '#FF8F00',
    salons: '#FF00FF',
    'it-tech': '#00D1FF',
    cas: '#A020F0',
    events: '#FFD700',
    general: '#00FF41',
    'pg-hostel': '#FF4500'
  };

  class Game {
    constructor() {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.minimapCanvas = document.getElementById('minimap-canvas');
      this.mmCtx = this.minimapCanvas.getContext('2d');
      
      this.player = {
        x: WORLD_SIZE / 2,
        y: WORLD_SIZE / 2,
        angle: 0,
        speed: 0,
        maxSpeed: 6,
        accel: 0.2,
        friction: 0.96,
        rotSpeed: 0.05
      };

      this.keys = {};
      this.pois = [];
      this.nearbyPoi = null;
      this.exp = 0;

      this.setupCanvas();
      this.listen();
      this.loadWorld();
    }

    setupCanvas() {
      const resize = () => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.minimapCanvas.width = 180;
        this.minimapCanvas.height = 180;
      };
      window.addEventListener('resize', resize);
      resize();
    }

    listen() {
      window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
      window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
      
      window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'e' && this.nearbyPoi) {
          this.enterBusiness(this.nearbyPoi);
        }
      });
    }

    async loadWorld() {
      try {
        const response = await fetch('../../../pages/directory/sites/index.json');
        const data = await response.json();
        
        // Randomly distribute POIs in world
        this.pois = data.map((item, idx) => ({
          ...item,
          x: 200 + Math.random() * (WORLD_SIZE - 400),
          y: 200 + Math.random() * (WORLD_SIZE - 400),
          id: idx
        }));

        document.getElementById('poi-count').textContent = this.pois.length;
        document.getElementById('loading').classList.remove('active');
        this.loop();
      } catch (e) {
        console.error('Failed to load world data', e);
      }
    }

    enterBusiness(poi) {
      console.log('Entering business:', poi.name);
      const url = `../../../pages/directory/sites/${poi.slug}.html`;
      if (global.VIANavigation) {
        global.VIANavigation.openPage(url);
      } else {
        window.location.href = url;
      }
    }

    update() {
      // Rotation
      if (this.keys['a']) this.player.angle -= this.player.rotSpeed;
      if (this.keys['d']) this.player.angle += this.player.rotSpeed;

      // Accel
      if (this.keys['w']) this.player.speed += this.player.accel;
      if (this.keys['s']) this.player.speed -= this.player.accel;

      this.player.speed *= this.player.friction;
      if (Math.abs(this.player.speed) < 0.1) this.player.speed = 0;
      
      this.player.x += Math.cos(this.player.angle) * this.player.speed;
      this.player.y += Math.sin(this.player.angle) * this.player.speed;

      // Clamp
      this.player.x = Math.max(0, Math.min(WORLD_SIZE, this.player.x));
      this.player.y = Math.max(0, Math.min(WORLD_SIZE, this.player.y));

      // Check Nearby POI
      let closest = null;
      let minDist = 80;
      
      this.pois.forEach(poi => {
        const dx = poi.x - this.player.x;
        const dy = poi.y - this.player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < minDist) {
          closest = poi;
          minDist = dist;
        }
      });

      this.nearbyPoi = closest;
      const prompt = document.getElementById('interact-prompt');
      if (closest) {
        prompt.classList.remove('hidden');
        document.getElementById('target-name').textContent = closest.name.toUpperCase();
        document.getElementById('location-name').textContent = closest.town.toUpperCase() + ' · ' + closest.area.toUpperCase();
      } else {
        prompt.classList.add('hidden');
      }
    }

    draw() {
      const { ctx, canvas, player } = this;
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width/2 - player.x, canvas.height/2 - player.y);

      // Draw Grid / Roads
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      for (let i = 0; i <= WORLD_SIZE; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0); ctx.lineTo(i, WORLD_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i); ctx.lineTo(WORLD_SIZE, i);
        ctx.stroke();
      }

      // Draw POIs
      this.pois.forEach(poi => {
        const color = COLORS[poi.category] || COLORS.general;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(poi.x, poi.y, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Label if close
        const dx = poi.x - player.x;
        const dy = poi.y - player.y;
        if (Math.abs(dx) < 300 && Math.abs(dy) < 300) {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px Syne';
          ctx.fillText(poi.name.substring(0, 15), poi.x + 15, poi.y + 5);
        }
      });

      // Draw Player (Triangle/Car pointer)
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.angle);
      ctx.fillStyle = COLORS.player;
      ctx.shadowBlur = 10; ctx.shadowColor = COLORS.player;
      ctx.beginPath();
      ctx.moveTo(15, 0); ctx.lineTo(-10, -10); ctx.lineTo(-10, 10); ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore();

      this.drawMinimap();
    }

    drawMinimap() {
      const { mmCtx, minimapCanvas, player } = this;
      mmCtx.fillStyle = '#000';
      mmCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);

      const scale = minimapCanvas.width / WORLD_SIZE;
      
      mmCtx.save();
      mmCtx.translate(minimapCanvas.width/2 - player.x * scale, minimapCanvas.height/2 - player.y * scale);

      // Main world
      mmCtx.strokeStyle = '#333';
      mmCtx.strokeRect(0, 0, WORLD_SIZE * scale, WORLD_SIZE * scale);

      // POIs on minimap
      this.pois.forEach(poi => {
        mmCtx.fillStyle = COLORS[poi.category] || COLORS.general;
        mmCtx.fillRect(poi.x * scale - 1, poi.y * scale - 1, 2, 2);
      });

      // Player on minimap
      mmCtx.fillStyle = '#fff';
      mmCtx.beginPath();
      mmCtx.arc(player.x * scale, player.y * scale, 3, 0, Math.PI * 2);
      mmCtx.fill();

      mmCtx.restore();
    }

    loop() {
      this.update();
      this.draw();
      requestAnimationFrame(() => this.loop());
    }
  }

  global.KutchCityGame = new Game();

})(window);
