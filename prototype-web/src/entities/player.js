// Fynnox als Zustandsautomat: idle · run · jump · doubleJump · fall.
// Bewegungswerte kommen aus data/characters.js. Gezeichnet wird eine stilechte
// Platzhalter-Silhouette (Fuchs im Nachtwächter-Cape). Sobald ein spriteSheet
// gesetzt ist, kann hier auf Sprite-Rendering umgestellt werden — ohne Logik zu ändern.

import { moveAndCollide } from '../systems/physics.js';

// Fallback-Werte für das Lauf-/Sprunggefühl. Eine Figur kann sie in
// data/characters.js über `motion` einzeln überschreiben.
const MOTION_DEFAULTS = {
  accel: 1750, friction: 2400, airAccel: 1250, airDrag: 500, turnBoost: 2.3,
  jumpCut: 0.42, coyoteTime: 0.10, jumpBuffer: 0.12, gravityFall: 1.28, maxFall: 980,
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

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
    this.motion = { ...MOTION_DEFAULTS, ...(character.motion || {}) };
    this.coyote = 0;            // Restzeit für den Sprung nach der Kante
    this.jumpBuffer = 0;        // vorgemerkter Sprung kurz vor der Landung
    this.jumpHeld = false;      // Sprungtaste seit dem Absprung gehalten?
    this.dust = [];             // Staubwölkchen bei Absprung, Landung und Lauf
    this.squash = 0;            // Aufprall-Stauchung (klingt ab)
    this.landImpact = 0;        // Wucht der letzten Landung (0..1), für die Kamera
    this.stepTimer = 0;
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
    const m = this.motion;

    // Horizontale Bewegung: beschleunigen statt schlagartig springen.
    const dir = (input.actions.right ? 1 : 0) - (input.actions.left ? 1 : 0);
    if (dir !== 0) {
      this.facing = dir;
      const turning = this.vx !== 0 && Math.sign(this.vx) !== dir;
      const accel = (this.onGround ? m.accel : m.airAccel) * (turning ? m.turnBoost : 1);
      this.vx = clamp(this.vx + dir * accel * dt, -c.moveSpeed, c.moveSpeed);
    } else {
      const drop = (this.onGround ? m.friction : m.airDrag) * dt;
      this.vx = Math.abs(this.vx) <= drop ? 0 : this.vx - Math.sign(this.vx) * drop;
    }
    // Rückstoß nach Treffer überlagert kurz die Eingabe
    if (Math.abs(this.knockback) > 6) { this.vx = this.knockback; this.knockback *= 0.85; } else this.knockback = 0;
    if (this.invuln > 0) this.invuln -= dt;

    // Sprung-Komfort: Coyote-Time (kurz nach der Kante) + Puffer (kurz vor der Landung)
    this.coyote = this.onGround ? m.coyoteTime : Math.max(0, this.coyote - dt);
    this.jumpBuffer = input.pressed.jump ? m.jumpBuffer : Math.max(0, this.jumpBuffer - dt);

    if (this.jumpBuffer > 0) {
      const maxJumps = c.doubleJumpEnabled ? 2 : 1;
      if (this.onGround || this.coyote > 0) {
        this.vy = -c.jumpVelocity; this.jumpsUsed = 1;
        this.jumpBuffer = 0; this.coyote = 0; this.jumpHeld = true;
        this._puff(7, 0.55);                       // Abdruck am Boden
      } else if (this.jumpsUsed < maxJumps) {
        this.vy = -c.jumpVelocity * 0.92; this.jumpsUsed++;
        this.jumpBuffer = 0; this.jumpHeld = true;
        this._puff(9, 0.4, true);                  // Luftstoß beim Doppelsprung
      }
    }
    // Taste früh loslassen = kürzerer Sprung (Sprunghöhe ist steuerbar)
    if (this.jumpHeld && !input.actions.jump) {
      if (this.vy < 0) this.vy *= m.jumpCut;
      this.jumpHeld = false;
    }

    const wasOnGround = this.onGround;
    const fallSpeed = this.vy;
    // Fallen fühlt sich besser an, wenn es etwas schneller geht als das Steigen.
    const gravity = level.gravity * (this.vy > 0 ? m.gravityFall : 1);
    moveAndCollide(this, level.platforms, gravity, dt);
    if (this.vy > m.maxFall) this.vy = m.maxFall;
    if (this.onGround && !wasOnGround) this.jumpsUsed = 0;
    if (this.onGround) this.jumpsUsed = 0;

    // Landung: Wucht aus der Fallgeschwindigkeit -> Staub, Stauchung, Kamerastoß
    this.landImpact = 0;
    if (this.onGround && !wasOnGround && fallSpeed > 180) {
      this.landImpact = Math.min(1, fallSpeed / m.maxFall);
      this.squash = 0.35 + this.landImpact * 0.65;
      this._puff(4 + Math.round(this.landImpact * 8), 0.5 + this.landImpact * 0.7);
    }
    this.squash = Math.max(0, this.squash - dt * 6);

    // Zustand bestimmen
    if (!this.onGround) this.state = this.vy < 0 ? (this.jumpsUsed >= 2 ? 'doubleJump' : 'jump') : 'fall';
    else this.state = Math.abs(this.vx) > 8 ? 'run' : 'idle';

    // Laufstaub im Schritttakt
    this.stepTimer -= dt;
    if (this.state === 'run' && this.stepTimer <= 0) { this._puff(1, 0.25); this.stepTimer = 0.22; }

    this._updateDust(dt);
    this.animTime += dt;

    // Level-Grenzen (nicht aus der Welt laufen)
    this.x = Math.max(0, Math.min(this.x, level.data.size.w - this.w));
    if (this.y > level.data.size.h + 200) { this.x = level.data.spawn.x; this.y = level.data.spawn.y; this.vy = 0; }
  }

  // Kollisionsrechteck in Weltkoordinaten (für Sammelobjekte).
  get rect() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  // Staubwölkchen an den Füßen. air = Luftstoß (fliegt zur Seite statt nach oben).
  _puff(count, strength, air = false) {
    const fx = this.x + this.w / 2, fy = this.y + this.h;
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * (air ? 2.4 : 1.6);
      this.dust.push({
        x: fx + spread * 9,
        y: fy - (air ? 6 : 2) - Math.random() * 3,
        vx: spread * (air ? 70 : 54) * strength - this.vx * 0.12,
        vy: (air ? 20 : -34) * strength * (0.6 + Math.random() * 0.8),
        r: (air ? 5.5 : 3.6) + Math.random() * 3.4 * strength,
        life: (air ? 0.26 : 0.34) + Math.random() * 0.24,
        maxLife: 1,
      });
    }
    for (const d of this.dust) d.maxLife = d.maxLife === 1 ? d.life : d.maxLife;
    if (this.dust.length > 90) this.dust.splice(0, this.dust.length - 90);
  }

  _updateDust(dt) {
    for (const d of this.dust) {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vy += 40 * dt;          // sinkt langsam zu Boden
      d.vx *= 0.94;
      d.r += dt * 9;            // zerfließt
      d.life -= dt;
    }
    this.dust = this.dust.filter((d) => d.life > 0);
  }

  _renderDust(ctx, camera) {
    for (const d of this.dust) {
      const a = Math.max(0, d.life / d.maxLife);
      ctx.fillStyle = `rgba(232,222,202,${(0.45 * a).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(d.x - camera.x, d.y - camera.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  render(ctx, camera) {
    const sx = this.x - camera.x, sy = this.y - camera.y;
    const col = this.char.colors;

    this._renderDust(ctx, camera);   // Staub liegt hinter der Figur

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
      // Um die Füße stauchen: Sprung/Fall leicht, Landung kräftig (klingt ab)
      ctx.translate(0, h / 2);
      ctx.scale(1 + this.squash * 0.20, sq * (1 - this.squash * 0.26));
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
