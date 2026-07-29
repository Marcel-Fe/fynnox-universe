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
    this.time = 0;
    // Sternenfeld (einmalig, deterministisch) für den Nachthimmel
    let seed = 1337;
    const rng = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    this.stars = Array.from({ length: 90 }, () => ({ x: rng(), y: rng() * 0.55, r: 0.4 + rng() * 1.4, tw: rng() * 6 }));
  }

  update(dt) {
    this.time += dt;
    this.dayNight.update(dt);
    for (const c of this.collectibles) c.update(dt);
  }

  // Zeichnet Himmel + Skyline + Boden + Plattformen. Held/HUD zeichnet main.js darüber.
  renderBackground(ctx, camera) {
    const theme = this.dayNight.theme();
    const W = ctx.canvas.width, H = ctx.canvas.height;

    const night = theme.moonAlpha; // 1 = Nacht, 0 = Tag

    // Himmel
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, theme.skyTop);
    sky.addColorStop(0.55, theme.skyBottom);
    sky.addColorStop(1, theme.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Sterne (nur nachts, sanftes Funkeln)
    if (night > 0.05) {
      for (const s of this.stars) {
        const a = night * (0.5 + 0.5 * Math.sin(this.time * 2 + s.tw));
        ctx.fillStyle = `rgba(230,240,255,${a * 0.9})`;
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Mond (Nacht) / Sonne (Tag)
    if (theme.moonAlpha > 0.02) drawMoon(ctx, W - 150, 96, 36, theme.moonAlpha);
    if (theme.sunAlpha > 0.02) drawOrb(ctx, 150, 90, 40, `rgba(255,225,150,${theme.sunAlpha})`);

    // Skyline (Parallax mit Fenster-Glow)
    this.parallax.render(ctx, camera, theme, H);

    // Horizont-Dunst für Tiefe (Neon-/Lichtschimmer über der Stadt)
    const groundY = 500 - camera.y;
    const haze = ctx.createLinearGradient(0, groundY - 170, 0, groundY);
    haze.addColorStop(0, 'rgba(0,0,0,0)');
    haze.addColorStop(1, night > 0.5 ? 'rgba(40,70,120,0.28)' : 'rgba(200,220,240,0.22)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, groundY - 170, W, 170);

    // Boden mit Verlauf + Glanzkante
    const gg = ctx.createLinearGradient(0, groundY, 0, H);
    gg.addColorStop(0, theme.ground); gg.addColorStop(1, 'rgba(4,8,14,1)');
    ctx.fillStyle = gg; ctx.fillRect(0, groundY, W, H - groundY);
    ctx.fillStyle = theme.groundTop; ctx.fillRect(0, groundY, W, 4);
    ctx.fillStyle = `rgba(233,169,59,${0.25 * night})`; ctx.fillRect(0, groundY, W, 1.5);

    // Plattformen — abgerundet mit goldener Oberkante + Schatten
    for (let i = 1; i < this.platforms.length; i++) {
      const p = this.platforms[i];
      const sx = p.x - camera.x, sy = p.y - camera.y;
      if (sx > W || sx + p.w < 0) continue;
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; roundRect(ctx, sx + 3, sy + 4, p.w, p.h, 6); ctx.fill();
      ctx.fillStyle = theme.ground; roundRect(ctx, sx, sy, p.w, p.h, 6); ctx.fill();
      ctx.fillStyle = theme.groundTop; roundRect(ctx, sx, sy, p.w, 4, 3); ctx.fill();
      ctx.fillStyle = `rgba(233,169,59,${0.35 * night})`; ctx.fillRect(sx + 3, sy, p.w - 6, 1.2);
    }

    // Kalter Nacht-Farbstich
    if (night > 0.02) { ctx.fillStyle = `rgba(12,22,48,${0.18 * night})`; ctx.fillRect(0, 0, W, H); }

    // Vignette (Fokus zur Mitte, moderner Look)
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
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

function drawMoon(ctx, x, y, r, a) {
  // Halo
  const g = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.6);
  g.addColorStop(0, `rgba(200,220,255,${0.35 * a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, Math.PI * 2); ctx.fill();
  // Scheibe
  ctx.fillStyle = `rgba(238,242,252,${a})`; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  // Krater
  ctx.fillStyle = `rgba(200,210,230,${a})`;
  ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.16, 0, 7); ctx.arc(x + r * 0.25, y + r * 0.28, r * 0.12, 0, 7); ctx.arc(x + r * 0.1, y - r * 0.35, r * 0.09, 0, 7); ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, h / 2, w / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
