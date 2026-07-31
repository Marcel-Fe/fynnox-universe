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
    // Echtes Hintergrundbild (aus dem Design-Sheet). Fällt sonst auf die Skyline zurück.
    this.bgImage = null;
    if (data.background) { const img = new Image(); img.onload = () => { this.bgImage = img; }; img.src = data.background; }
    // Schwebende Licht-Partikel (Glut/Leuchtstaub) + treibender Nebel -> Lebendigkeit
    this.motes = Array.from({ length: 32 }, () => ({ x: rng(), y: rng(), r: 0.8 + rng() * 2.6, ph: rng() * 6.28, vx: (rng() - 0.35) * 0.012, vy: -(0.006 + rng() * 0.016) }));
    this.fog = Array.from({ length: 3 }, () => ({ x: rng(), y: 0.62 + rng() * 0.18, r: 130 + rng() * 120, sp: 0.004 + rng() * 0.006 }));
  }

  update(dt) {
    this.time += dt;
    this.dayNight.update(dt);
    for (const c of this.collectibles) c.update(dt);
    // Partikel + Nebel driften
    for (const m of this.motes) {
      m.x += m.vx * dt; m.y += m.vy * dt;
      if (m.y < -0.05) { m.y = 1.05; m.x = (m.x * 7.3 % 1 + 1) % 1; }
      if (m.x < -0.05) m.x = 1.05; else if (m.x > 1.05) m.x = -0.05;
    }
    for (const f of this.fog) { f.x += f.sp * dt; if (f.x > 1.25) f.x = -0.25; }
  }

  // Nebelschwaden über dem Hintergrund (Tiefe/Atmosphäre)
  _renderFog(ctx, W, groundY) {
    for (const f of this.fog) {
      const x = ((f.x % 1) + 1) % 1 * (W + 2 * f.r) - f.r, y = groundY - 40 - f.y * 60;
      const g = ctx.createRadialGradient(x, y, 4, x, y, f.r);
      g.addColorStop(0, 'rgba(120,150,200,0.10)'); g.addColorStop(1, 'rgba(120,150,200,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, f.r, f.r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Schwebende Licht-Partikel (Glut) im Vordergrund
  _renderMotes(ctx, W, H) {
    for (const m of this.motes) {
      const a = 0.18 + 0.4 * (0.5 + 0.5 * Math.sin(this.time * 1.6 + m.ph));
      const x = m.x * W, y = m.y * H, r = m.r * 4;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(247,214,140,${a})`); g.addColorStop(1, 'rgba(247,214,140,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Zeichnet Himmel + Skyline + Boden + Plattformen. Held/HUD zeichnet main.js darüber.
  renderBackground(ctx, camera) {
    const theme = this.dayNight.theme();
    const W = camera.viewW, H = camera.viewH;

    const night = theme.moonAlpha; // 1 = Nacht, 0 = Tag
    const groundY = 500 - camera.y;

    if (this.bgImage) {
      // Raven City als weit entfernte Ebene: langsam mitscrollend und spiegelnd
      // gekachelt (jede zweite Kachel gespiegelt -> keine sichtbaren Nahtkanten).
      ctx.fillStyle = theme.skyBottom; ctx.fillRect(0, 0, W, H);
      // Das Bild reicht bis zum unteren Rand: unter der Bodenkante bleibt die
      // gemalte Stadt sichtbar statt einer leeren Fläche.
      const dh = Math.max(groundY + 4, H), dw = dh * (this.bgImage.width / this.bgImage.height);
      const scroll = camera.x * 0.35;
      const first = Math.floor(scroll / dw);
      for (let i = first; i * dw - scroll < W; i++) {
        const x = i * dw - scroll;
        if ((((i % 2) + 2) % 2) === 1) {
          ctx.save(); ctx.translate(x + dw, 0); ctx.scale(-1, 1);
          ctx.drawImage(this.bgImage, 0, 0, dw, dh); ctx.restore();
        } else {
          ctx.drawImage(this.bgImage, x, 0, dw, dh);
        }
      }
      // Tag-Aufhellung / Nacht-Vertiefung
      if (theme.sunAlpha > 0.02) { ctx.fillStyle = `rgba(255,238,190,${0.4 * theme.sunAlpha})`; ctx.fillRect(0, 0, W, groundY); }
      if (night > 0.02) { ctx.fillStyle = `rgba(10,18,40,${0.15 * night})`; ctx.fillRect(0, 0, W, groundY); }
      this._renderFog(ctx, W, groundY);
      // unteren Spielbereich abdunkeln -> Figuren heben sich klar ab (Tiefe/Fokus)
      const dk = ctx.createLinearGradient(0, groundY - 230, 0, groundY);
      dk.addColorStop(0, 'rgba(6,10,20,0)'); dk.addColorStop(1, 'rgba(6,10,20,0.5)');
      ctx.fillStyle = dk; ctx.fillRect(0, groundY - 230, W, 230);
    } else {
      // Fallback: gezeichneter Himmel + Sterne + Mond + Skyline
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, theme.skyTop); sky.addColorStop(0.55, theme.skyBottom); sky.addColorStop(1, theme.skyBottom);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      if (night > 0.05) for (const s of this.stars) { const a = night * (0.5 + 0.5 * Math.sin(this.time * 2 + s.tw)); ctx.fillStyle = `rgba(230,240,255,${a * 0.9})`; ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2); ctx.fill(); }
      if (theme.moonAlpha > 0.02) drawMoon(ctx, W - 150, 96, 36, theme.moonAlpha);
      if (theme.sunAlpha > 0.02) drawOrb(ctx, 150, 90, 40, `rgba(255,225,150,${theme.sunAlpha})`);
      this.parallax.render(ctx, camera, theme, H);
      const haze = ctx.createLinearGradient(0, groundY - 170, 0, groundY);
      haze.addColorStop(0, 'rgba(0,0,0,0)'); haze.addColorStop(1, night > 0.5 ? 'rgba(40,70,120,0.28)' : 'rgba(200,220,240,0.22)');
      ctx.fillStyle = haze; ctx.fillRect(0, groundY - 170, W, 170);
    }

    // Boden: dunkler Schleier statt deckender Fläche -> die gemalte Stadt bleibt darunter sichtbar
    const gg = ctx.createLinearGradient(0, groundY, 0, H);
    gg.addColorStop(0, 'rgba(8,14,26,0.86)'); gg.addColorStop(1, 'rgba(3,6,12,0.97)');
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
    if (night > 0.02) { ctx.fillStyle = `rgba(12,22,48,${0.12 * night})`; ctx.fillRect(0, 0, W, H); }

    // Schwebende Licht-Partikel (Leben + moderner Glanz)
    this._renderMotes(ctx, W, H);

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
