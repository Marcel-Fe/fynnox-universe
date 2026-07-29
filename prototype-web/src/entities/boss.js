// Boss "Dr. Vorax" (Kanon: Krokodil, Meister der Energie). Kindgerecht (6+):
// keine Gewalt — er schleudert Energiebälle, Fynnox weicht aus. Fällt sein Schild,
// kann Fynnox nah heran + Aktion drücken (oder auf den Kopf springen) und zuschlagen.
// 3 Treffer = besiegt. Zustandsautomat: idle → attack (Schild) → vulnerable → (hit) → …
import { PALETTE } from '../../data/characters.js';

export class Boss {
  constructor(spec) {
    Object.assign(this, { w: 74, h: 96 }, spec);
    this.maxHp = spec.maxHp || 3;
    this.reset();
  }

  reset() {
    this.hp = this.maxHp;
    this.state = 'idle';
    this.timer = 0;
    this.orbs = [];
    this.orbsThrown = 0;
    this.phase = 0;
    this.defeated = false;
    this.t = 0;
    this.hitFlash = 0;
    this.playerHit = false;
    this.lastHitDir = 1;
  }

  get shieldOn() { return this.state === 'attack' || this.state === 'idle'; }
  center() { return { x: this.x + this.w / 2, y: this.y + this.h / 2 }; }

  update(dt, player, input) {
    this.t += dt;
    this.playerHit = false;
    if (this.hitFlash > 0) this.hitFlash -= dt;

    this._updateOrbs(dt, player);
    if (this.defeated) return;

    const c = this.center();
    const px = player.x + player.w / 2;
    const dist = Math.hypot(c.x - px, c.y - (player.y + player.h / 2));
    this.timer += dt;

    switch (this.state) {
      case 'idle':
        if (dist < 660) { this.state = 'attack'; this.timer = 0; this.orbsThrown = 0; }
        break;

      case 'attack': {
        const interval = Math.max(0.5, 0.85 - this.phase * 0.12);
        if (this.timer >= interval) {
          this.timer = 0;
          this._throwOrb(player);
          this.orbsThrown++;
          if (this.orbsThrown >= 3) { this.state = 'vulnerable'; this.timer = 0; }
        }
        break;
      }

      case 'vulnerable': {
        const near = dist < 82;
        const stomp = player.vy > 0 && (player.y + player.h) < (this.y + this.h * 0.5) && Math.abs(px - c.x) < this.w * 0.7;
        if (near && (input.pressed.action || stomp)) {
          this.hp--; this.hitFlash = 0.5; this.phase++;
          if (player.vy > 0) player.vy = -420;         // kleiner Abpraller beim Kopfsprung
          if (this.hp <= 0) { this.defeated = true; this.state = 'defeated'; this.orbs = []; }
          else { this.state = 'attack'; this.timer = 0; this.orbsThrown = 0; }
        } else if (this.timer > Math.max(1.6, 2.6 - this.phase * 0.3)) {
          this.state = 'attack'; this.timer = 0; this.orbsThrown = 0; // Fenster verpasst
        }
        break;
      }
    }
  }

  _throwOrb(player) {
    const bx = this.x + this.w / 2, by = this.y + this.h * 0.35;
    const px = player.x + player.w / 2, py = player.y + player.h / 2;
    const dx = px - bx, dy = py - by, len = Math.hypot(dx, dy) || 1;
    const speed = 165 + this.phase * 28;
    this.orbs.push({ x: bx, y: by, vx: dx / len * speed, vy: dy / len * speed, r: 12, life: 5, t: 0 });
  }

  _updateOrbs(dt, player) {
    const pr = player.rect;
    for (const o of this.orbs) {
      o.x += o.vx * dt; o.y += o.vy * dt; o.life -= dt; o.t += dt;
      const cx = Math.max(pr.x, Math.min(o.x, pr.x + pr.w));
      const cy = Math.max(pr.y, Math.min(o.y, pr.y + pr.h));
      if (Math.hypot(o.x - cx, o.y - cy) < o.r && player.invuln <= 0) {
        this.playerHit = true; this.lastHitDir = o.vx >= 0 ? 1 : -1; o.life = -1;
      }
    }
    this.orbs = this.orbs.filter((o) => o.life > 0 && o.y < 600 && o.x > -40 && o.x < (this.levelW || 3200) + 40);
  }

  render(ctx, camera) {
    const sx = this.x - camera.x, sy = this.y - camera.y;
    // Energiebälle
    for (const o of this.orbs) {
      const ox = o.x - camera.x, oy = o.y - camera.y;
      const g = ctx.createRadialGradient(ox, oy, 1, ox, oy, o.r * 2);
      g.addColorStop(0, 'rgba(200,120,255,0.9)'); g.addColorStop(1, 'rgba(122,60,196,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, o.r * 2, 0, 7); ctx.fill();
      ctx.fillStyle = '#C77BFF'; ctx.beginPath(); ctx.arc(ox, oy, o.r * 0.7, 0, 7); ctx.fill();
    }

    ctx.save();
    ctx.translate(sx + this.w / 2, sy + this.h / 2);

    if (this.state === 'defeated') { ctx.rotate(0.25); ctx.globalAlpha = 0.9; }
    const pant = this.state === 'vulnerable' ? 1 + Math.sin(this.t * 10) * 0.03 : 1;
    ctx.scale(1, pant);
    const w = this.w, h = this.h;

    // Schatten
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, h / 2, w * 0.42, 7, 0, 0, 7); ctx.fill();

    // Schwanz
    ctx.fillStyle = '#3E7D45'; ctx.beginPath(); ctx.moveTo(-w * 0.2, h * 0.2); ctx.quadraticCurveTo(-w * 0.75, h * 0.35, -w * 0.6, -h * 0.05); ctx.quadraticCurveTo(-w * 0.4, h * 0.2, -w * 0.2, h * 0.35); ctx.fill();

    // Beine
    ctx.fillStyle = '#356b3c'; roundRect(ctx, -w * 0.24, h * 0.28, w * 0.2, h * 0.2, 4); ctx.fill(); roundRect(ctx, w * 0.04, h * 0.28, w * 0.2, h * 0.2, 4); ctx.fill();

    // Laborkittel (Körper)
    ctx.fillStyle = '#EAE6DA'; roundRect(ctx, -w * 0.3, -h * 0.1, w * 0.6, h * 0.45, 10); ctx.fill();
    ctx.strokeStyle = '#c9c3b2'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -h * 0.1); ctx.lineTo(0, h * 0.35); ctx.stroke();
    // Energie-Kristall an der Brust
    ctx.fillStyle = this.state === 'vulnerable' ? '#C77BFF' : PALETTE.crystal;
    ctx.beginPath(); ctx.moveTo(0, h * 0.02); ctx.lineTo(6, h * 0.1); ctx.lineTo(0, h * 0.18); ctx.lineTo(-6, h * 0.1); ctx.fill();

    // Arme
    ctx.fillStyle = '#3E7D45'; roundRect(ctx, -w * 0.44, -h * 0.06, w * 0.16, h * 0.28, 6); ctx.fill(); roundRect(ctx, w * 0.28, -h * 0.06, w * 0.16, h * 0.28, 6); ctx.fill();

    // Kopf (breite Krokodilschnauze)
    ctx.fillStyle = '#3E7D45'; roundRect(ctx, -w * 0.32, -h * 0.5, w * 0.64, h * 0.42, 12); ctx.fill();
    ctx.fillStyle = '#4b9153'; roundRect(ctx, w * 0.0, -h * 0.44, w * 0.5, h * 0.16, 8); ctx.fill(); // Schnauze
    // Zähne (freundlich)
    ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(w * 0.06 + i * w * 0.1, -h * 0.28); ctx.lineTo(w * 0.1 + i * w * 0.1, -h * 0.22); ctx.lineTo(w * 0.14 + i * w * 0.1, -h * 0.28); ctx.fill(); }
    // Augen
    const eye = this.state === 'vulnerable' ? '#C77BFF' : '#F5C560';
    ctx.fillStyle = '#2a3a2c'; ctx.beginPath(); ctx.arc(-w * 0.12, -h * 0.46, 8, 0, 7); ctx.arc(w * 0.08, -h * 0.46, 8, 0, 7); ctx.fill();
    ctx.fillStyle = eye; ctx.beginPath(); ctx.arc(-w * 0.12, -h * 0.46, 4, 0, 7); ctx.arc(w * 0.08, -h * 0.46, 4, 0, 7); ctx.fill();

    // Treffer-Blitz
    if (this.hitFlash > 0) { ctx.globalAlpha = Math.min(0.7, this.hitFlash); ctx.fillStyle = '#fff'; roundRect(ctx, -w * 0.34, -h * 0.5, w * 0.68, h, 12); ctx.fill(); ctx.globalAlpha = 1; }

    ctx.restore();

    // Schild-Blase
    if (this.shieldOn && !this.defeated) {
      const cx = sx + this.w / 2, cy = sy + this.h / 2, rr = this.w * 0.85;
      const g = ctx.createRadialGradient(cx, cy, rr * 0.6, cx, cy, rr);
      g.addColorStop(0, 'rgba(47,211,224,0.05)'); g.addColorStop(0.8, 'rgba(47,211,224,0.12)'); g.addColorStop(1, 'rgba(47,211,224,0.35)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(120,230,240,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 7); ctx.stroke();
    }
    // "Jetzt!" Hinweis im verwundbaren Fenster
    if (this.state === 'vulnerable') {
      ctx.fillStyle = '#F5C560'; ctx.font = '800 14px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('JETZT!  (E)', sx + this.w / 2, sy - 14); ctx.textAlign = 'left';
    }
    // Sterne beim Besiegtsein
    if (this.defeated) {
      for (let i = 0; i < 3; i++) { const a = this.t * 3 + i * 2.1; ctx.fillStyle = '#F5C560'; star(ctx, sx + this.w / 2 + Math.cos(a) * 26, sy + 6 + Math.sin(a) * 8, 5); }
    }
  }
}

function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); const b = a + Math.PI / 5; ctx.lineTo(x + Math.cos(b) * r * 0.45, y + Math.sin(b) * r * 0.45); }
  ctx.closePath(); ctx.fill();
}
function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
