// Baut aus reinen Level-Daten die spielbare Welt: Parallax, Plattformen, Sammelobjekte,
// Tag/Nacht. Kein levelspezifischer Code — alles kommt aus data/levels/*.js.

import { Parallax } from './parallax.js';
import { DayNight } from './daynight.js';
import { Collectible } from '../entities/collectible.js';

export class Level {
  constructor(data) {
    this.data = data;
    this.platforms = data.platforms;
    this.gravity = data.gravity;
    this.parallax = new Parallax(data.parallaxLayers, data.size.w);
    this.dayNight = new DayNight(data);
    this.collectibles = data.collectibles.map((c) => new Collectible(c));
  }

  update(dt) {
    this.dayNight.update(dt);
    for (const c of this.collectibles) c.update(dt);
  }

  // Zeichnet Himmel + Skyline + Boden + Plattformen. Held/HUD zeichnet main.js darüber.
  renderBackground(ctx, camera) {
    const theme = this.dayNight.theme();
    const W = ctx.canvas.width, H = ctx.canvas.height;

    // Himmel
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, theme.skyTop);
    sky.addColorStop(1, theme.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Mond (Nacht) / Sonne (Tag)
    if (theme.moonAlpha > 0.02) drawOrb(ctx, W - 140, 90, 34, `rgba(245,235,205,${theme.moonAlpha})`);
    if (theme.sunAlpha > 0.02) drawOrb(ctx, 150, 90, 40, `rgba(255,225,150,${theme.sunAlpha})`);

    // Skyline
    this.parallax.render(ctx, camera, theme, H);

    // Boden
    const groundY = 500 - camera.y;
    ctx.fillStyle = theme.ground;
    ctx.fillRect(0, groundY, W, H - groundY);
    ctx.fillStyle = theme.groundTop;
    ctx.fillRect(0, groundY, W, 6);

    // Plattformen (außer Boden, der ist schon gezeichnet)
    ctx.fillStyle = theme.ground;
    for (let i = 1; i < this.platforms.length; i++) {
      const p = this.platforms[i];
      const sx = p.x - camera.x, sy = p.y - camera.y;
      if (sx > W || sx + p.w < 0) continue;
      ctx.fillStyle = theme.ground;
      ctx.fillRect(sx, sy, p.w, p.h);
      ctx.fillStyle = theme.groundTop;
      ctx.fillRect(sx, sy, p.w, 5);
    }

    // Ambient-Overlay für Stimmung
    const nightAmount = this.dayNight.themes.night ? (1 - this.dayNight.t) : 0;
    if (nightAmount > 0.02) {
      ctx.fillStyle = `rgba(10,20,45,${0.22 * nightAmount})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  renderCollectibles(ctx, camera) {
    for (const c of this.collectibles) c.render(ctx, camera);
  }
}

function drawOrb(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.2);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
