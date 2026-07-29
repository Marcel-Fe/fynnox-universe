// Fynnox als Zustandsautomat: idle · run · jump · doubleJump · fall.
// Bewegungswerte kommen aus data/characters.js. Gezeichnet wird eine stilechte
// Platzhalter-Silhouette (Fuchs im Nachtwächter-Cape). Sobald ein spriteSheet
// gesetzt ist, kann hier auf Sprite-Rendering umgestellt werden — ohne Logik zu ändern.

import { moveAndCollide } from '../systems/physics.js';

export class Player {
  constructor(character, spawn) {
    this.char = character;
    this.w = character.width;
    this.h = character.height;
    this.x = spawn.x;
    this.y = spawn.y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;            // 1 = rechts, -1 = links
    this.state = 'idle';
    this.jumpsUsed = 0;         // 0 am Boden, 1 nach Sprung, 2 nach Doppelsprung
    this.animTime = 0;
    this.invuln = 0;            // Unverwundbarkeit nach Treffer (Sekunden)
    this.knockback = 0;         // aktive Rückstoß-Geschwindigkeit
    // Echtes Sprite laden (falls vorhanden). Fällt sonst auf die Silhouette zurück.
    this.sprite = null;
    if (character.spriteSheet) { const img = new Image(); img.onload = () => { this.sprite = img; }; img.src = character.spriteSheet; }
    // Puppet-Teile laden (Körper/Schwanz/Bein). Erst wenn alle da sind, wird animiert
    // gezeichnet — sonst bleibt es beim Einzelbild bzw. der Silhouette.
    this.parts = null;
    const pup = character.puppet;
    if (pup) {
      const imgs = {};
      let pending = 3;
      for (const key of ['body', 'tail', 'leg']) {
        const img = new Image();
        img.onload = () => { if (--pending === 0) this.parts = imgs; };
        img.src = pup[key];
        imgs[key] = img;
      }
    }
  }

  // Wird getroffen: kurz unverwundbar + Rückstoß weg vom Angreifer.
  hurt(dirX) {
    if (this.invuln > 0) return false;
    this.invuln = 1.2;
    this.knockback = dirX * 260;
    this.vy = -320;
    return true;
  }

  update(input, level, dt) {
    const c = this.char;

    // Horizontale Bewegung
    this.vx = 0;
    if (input.actions.left)  { this.vx = -c.moveSpeed; this.facing = -1; }
    if (input.actions.right) { this.vx =  c.moveSpeed; this.facing =  1; }
    // Rückstoß nach Treffer überlagert kurz die Eingabe
    if (Math.abs(this.knockback) > 6) { this.vx = this.knockback; this.knockback *= 0.85; } else this.knockback = 0;
    if (this.invuln > 0) this.invuln -= dt;

    // Springen / Doppelsprung (nur im Frame des Drückens)
    if (input.pressed.jump) {
      const maxJumps = c.doubleJumpEnabled ? 2 : 1;
      if (this.onGround) { this.vy = -c.jumpVelocity; this.jumpsUsed = 1; }
      else if (this.jumpsUsed < maxJumps) { this.vy = -c.jumpVelocity * 0.92; this.jumpsUsed++; }
    }

    const wasOnGround = this.onGround;
    moveAndCollide(this, level.platforms, level.gravity, dt);
    if (this.onGround && !wasOnGround) this.jumpsUsed = 0;
    if (this.onGround) this.jumpsUsed = 0;

    // Zustand bestimmen
    if (!this.onGround) this.state = this.vy < 0 ? (this.jumpsUsed >= 2 ? 'doubleJump' : 'jump') : 'fall';
    else this.state = Math.abs(this.vx) > 1 ? 'run' : 'idle';

    this.animTime += dt;

    // Level-Grenzen (nicht aus der Welt laufen)
    this.x = Math.max(0, Math.min(this.x, level.data.size.w - this.w));
    if (this.y > level.data.size.h + 200) { this.x = level.data.spawn.x; this.y = level.data.spawn.y; this.vy = 0; }
  }

  // Kollisionsrechteck in Weltkoordinaten (für Sammelobjekte).
  get rect() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  render(ctx, camera) {
    const sx = this.x - camera.x, sy = this.y - camera.y;
    const col = this.char.colors;

    // Lauf-Wippen / Sprung-Stauchen (die Puppet-Animation wippt selbst)
    let bob = 0, squash = 1;
    if (this.state === 'run' && !this.parts) bob = Math.sin(this.animTime * 14) * 2;
    if (this.state === 'jump' || this.state === 'doubleJump') squash = 1.06;
    if (this.state === 'fall') squash = 0.96;

    ctx.save();
    // Treffer-Blinken
    if (this.invuln > 0 && Math.floor(this.animTime * 14) % 2 === 0) ctx.globalAlpha = 0.35;
    ctx.translate(sx + this.w / 2, sy + this.h / 2 + bob);
    ctx.scale(this.facing, 1);

    const w = this.w, h = this.h;

    // Schatten am Boden
    if (this.onGround) {
      ctx.save();
      ctx.scale(1 / this.facing, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath(); ctx.ellipse(0, h / 2 + 2, w * 0.4, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Echtes Fynnox-Sprite (falls geladen) — sonst weiter mit der Silhouette
    const art = this.parts ? this.parts.body : this.sprite;
    if (art) {
      const dh = h * 1.9, dw = dh * (art.width / art.height);
      const sq = this.state === 'jump' || this.state === 'doubleJump' ? 1.04 : (this.state === 'fall' ? 0.97 : 1);
      // weicher Glow hinter dem Helden -> hebt ihn klar vom Hintergrund ab
      const gl = ctx.createRadialGradient(0, -dh * 0.35 + h / 2, 4, 0, -dh * 0.35 + h / 2, dw * 0.95);
      gl.addColorStop(0, 'rgba(47,150,200,0.5)'); gl.addColorStop(0.6, 'rgba(20,40,70,0.35)'); gl.addColorStop(1, 'rgba(20,40,70,0)');
      ctx.save(); ctx.scale(1 / this.facing, 1); ctx.fillStyle = gl;
      ctx.beginPath(); ctx.ellipse(0, -dh * 0.35 + h / 2, dw * 0.7, dh * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.translate(0, h / 2); ctx.scale(1, sq); // um die Füße stauchen
      ctx.imageSmoothingEnabled = true;
      if (this.parts) this._renderPuppet(ctx, dw, dh);
      else ctx.drawImage(this.sprite, -dw / 2, -dh, dw, dh);
      ctx.restore();
      return;
    }

    // Cape (Nachtwächter) hinter dem Körper
    ctx.fillStyle = col.cape;
    ctx.beginPath();
    ctx.moveTo(-w * 0.15, -h * 0.25);
    ctx.quadraticCurveTo(-w * 0.55, 0, -w * 0.35, h * 0.45);
    ctx.lineTo(w * 0.05, h * 0.35);
    ctx.closePath(); ctx.fill();

    // Schwanz
    ctx.fillStyle = col.fur;
    ctx.beginPath();
    ctx.moveTo(-w * 0.1, h * 0.1);
    ctx.quadraticCurveTo(-w * 0.6, h * 0.05, -w * 0.5, -h * 0.2);
    ctx.quadraticCurveTo(-w * 0.3, h * 0.05, -w * 0.1, h * 0.25);
    ctx.closePath(); ctx.fill();
    // Schwanzspitze hell
    ctx.fillStyle = col.belly;
    ctx.beginPath(); ctx.ellipse(-w * 0.5, -h * 0.15, 5, 6, 0, 0, Math.PI * 2); ctx.fill();

    // Körper
    ctx.save();
    ctx.scale(1, squash);
    ctx.fillStyle = col.fur;
    roundRect(ctx, -w * 0.28, -h * 0.15, w * 0.56, h * 0.5, 10); ctx.fill();
    // Bauch
    ctx.fillStyle = col.belly;
    roundRect(ctx, -w * 0.14, -h * 0.05, w * 0.28, h * 0.32, 7); ctx.fill();
    // Pfoten-Emblem (Gold)
    ctx.fillStyle = col.emblem;
    ctx.beginPath(); ctx.arc(0, h * 0.06, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-3, h * 0.0, 1.6, 0, Math.PI * 2); ctx.arc(3, h * 0.0, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Beine (laufen: wechselnd)
    ctx.fillStyle = col.cape;
    const legSwing = this.state === 'run' ? Math.sin(this.animTime * 14) * 6 : 0;
    roundRect(ctx, -w * 0.2 + legSwing, h * 0.3, w * 0.16, h * 0.2, 4); ctx.fill();
    roundRect(ctx, w * 0.05 - legSwing, h * 0.3, w * 0.16, h * 0.2, 4); ctx.fill();

    // Kopf
    ctx.fillStyle = col.fur;
    ctx.beginPath(); ctx.arc(w * 0.05, -h * 0.32, w * 0.3, 0, Math.PI * 2); ctx.fill();
    // Ohren
    ctx.beginPath();
    ctx.moveTo(-w * 0.15, -h * 0.5); ctx.lineTo(-w * 0.02, -h * 0.7); ctx.lineTo(w * 0.06, -h * 0.48); ctx.closePath(); ctx.fill();
    ctx.moveTo(w * 0.14, -h * 0.52); ctx.lineTo(w * 0.28, -h * 0.72); ctx.lineTo(w * 0.32, -h * 0.5); ctx.closePath(); ctx.fill();
    // Ohr-Innenseite
    ctx.fillStyle = col.furLight;
    ctx.beginPath();
    ctx.moveTo(-w * 0.08, -h * 0.53); ctx.lineTo(-w * 0.02, -h * 0.64); ctx.lineTo(w * 0.03, -h * 0.52); ctx.closePath(); ctx.fill();

    // Schnauze hell
    ctx.fillStyle = col.belly;
    ctx.beginPath(); ctx.ellipse(w * 0.22, -h * 0.28, w * 0.16, w * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    // Nase
    ctx.fillStyle = '#2A1B14';
    ctx.beginPath(); ctx.arc(w * 0.36, -h * 0.3, 2.6, 0, Math.PI * 2); ctx.fill();

    // Goggles (Nachtwächter) über den Augen — mit türkisem Leuchten
    ctx.strokeStyle = col.emblem; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-w * 0.16, -h * 0.4); ctx.lineTo(w * 0.28, -h * 0.42); ctx.stroke();
    const gl = ctx.createRadialGradient(w * 0.11, -h * 0.38, 1, w * 0.11, -h * 0.38, 12);
    gl.addColorStop(0, 'rgba(47,211,224,0.55)'); gl.addColorStop(1, 'rgba(47,211,224,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(w * 0.11, -h * 0.38, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col.goggles;
    ctx.beginPath(); ctx.arc(w * 0.02, -h * 0.38, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.2, -h * 0.39, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(w * 0.03, -h * 0.39, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.21, -h * 0.4, 1.4, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  // Puppet-Animation: Schwanz, hinteres Bein, vorderes Bein und Körper werden aus
  // demselben Artwork getrennt gezeichnet und je Zustand bewegt. Der Kontext ist bereits
  // gespiegelt (facing) und auf die Fußlinie (y = 0) verschoben.
  _renderPuppet(ctx, dw, dh) {
    const p = this.char.puppet;
    const t = this.animTime;
    const step = t * p.stepRate;
    let legFront = 0, legBack = 0, tail = 0, lean = 0, lift = 0;

    switch (this.state) {
      case 'run':
        legFront = -Math.sin(step) * p.stepAngle;
        legBack = Math.sin(step) * p.stepAngle;
        tail = 0.16 + Math.sin(step * 0.5) * 0.08;
        lean = -0.07;
        lift = Math.abs(Math.sin(step)) * 0.022;   // Wippen im Schritt
        break;
      case 'jump':
      case 'doubleJump':
        legFront = -0.5; legBack = 0.26; tail = 0.3; lean = -0.06;
        break;
      case 'fall':
        legFront = 0.3; legBack = -0.34; tail = -0.16; lean = 0.05;
        break;
      default: // idle — ruhiges Atmen, Schwanz wedelt
        tail = Math.sin(t * 1.8) * 0.09;
        lift = Math.sin(t * 1.8) * 0.004;
        break;
    }

    // Beine bleiben am Boden, Körper und Schwanz wippen (lift).
    const draw = (img, pivot, angle, off, bob = 0) => {
      ctx.save();
      const cx = -dw / 2 + pivot.x * dw;
      const cy = -dh + pivot.y * dh;
      ctx.translate(cx + (off ? off.x * dw : 0), cy - bob * dh + (off ? off.y * dh : 0));
      ctx.rotate(angle);
      ctx.translate(-cx, -cy);
      if (off && off.brightness) ctx.filter = `brightness(${off.brightness})`;
      ctx.drawImage(img, -dw / 2, -dh, dw, dh);
      ctx.restore();
    };

    draw(this.parts.tail, p.tailRoot, tail, null, lift);
    draw(this.parts.leg, p.hip, legBack, p.backLeg);
    draw(this.parts.leg, p.hip, legFront);
    draw(this.parts.body, p.hip, lean, null, lift);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
