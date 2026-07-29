// Interaktive Missions-Objekte: 'rescue' (Katze), 'fire' (Brand löschen), 'thief' (Dieb jagen).
// Datengetrieben aus den Missionen. Interaktion über die Aktion (E / Pfote).
import { PALETTE } from '../../data/characters.js';

export class Interactable {
  constructor(spec) {
    Object.assign(this, { w: 34, h: 34, done: false, near: false, t: Math.random() * 6 }, spec);
    this.hp = spec.type === 'fire' ? 1 : 0;   // Feuer: Lösch-Fortschritt
    this.startX = this.x;
  }

  center() { return { x: this.x + this.w / 2, y: this.y + this.h / 2 }; }

  dist(player) {
    const a = this.center(), bx = player.x + player.w / 2, by = player.y + player.h / 2;
    return Math.hypot(a.x - bx, a.y - by);
  }

  // Rückgabe true, wenn dieses Objekt gerade FERTIG wurde.
  update(dt, player, input) {
    this.t += dt;
    if (this.done) return false;
    const d = this.dist(player);
    this.near = d < 90;

    if (this.type === 'thief') {
      // Flieht vor dem Spieler, ist aber einholbar (langsamer als Fynnox).
      const a = this.center(), px = player.x + player.w / 2;
      if (d < 300) this.x += (a.x < px ? -1 : 1) * 200 * dt; // weg vom Spieler
      this.x = Math.max(this.startX - 40, Math.min(this.x, (this.levelW || 3200) - this.w));
      if (d < 56 && (input.pressed.action || d < 30)) { this.done = true; return true; }
      return false;
    }

    if (this.type === 'fire') {
      if (this.near && input.actions.action) {
        this.hp -= dt * 0.7;                 // löschen, solange Aktion gehalten
        if (this.hp <= 0) { this.hp = 0; this.done = true; return true; }
      }
      return false;
    }

    // rescue (Katze): in Reichweite + Aktion drücken
    if (this.near && input.pressed.action) { this.done = true; return true; }
    return false;
  }

  render(ctx, camera) {
    const sx = this.x - camera.x, sy = this.y - camera.y;
    if (sx < -60 || sx > ctx.canvas.width + 60) return;
    ctx.save();
    ctx.translate(sx + this.w / 2, sy + this.h / 2);
    if (this.type === 'fire') this._fire(ctx);
    else if (this.type === 'thief') this._thief(ctx);
    else this._cat(ctx);
    ctx.restore();

    // Interaktions-Hinweis
    if (this.near && !this.done && this.type !== 'thief') this._prompt(ctx, sx + this.w / 2, sy - 16, 'E');
    if (this.type === 'thief' && this.near && !this.done) this._prompt(ctx, sx + this.w / 2, sy - 24, 'E');
  }

  _prompt(ctx, x, y, key) {
    const bob = Math.sin(this.t * 5) * 2;
    ctx.fillStyle = 'rgba(14,26,43,0.9)'; ctx.strokeStyle = PALETTE.gold; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y + bob, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = PALETTE.goldLight; ctx.font = '700 13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(key, x, y + bob + 1); ctx.textAlign = 'left';
  }

  _cat(ctx) {
    if (this.done) { // gerettet: kleiner Haken
      ctx.fillStyle = '#5ED17A'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0B1424'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-1, 5); ctx.lineTo(6, -5); ctx.stroke();
      return;
    }
    const b = Math.sin(this.t * 4) * 1.5;
    ctx.fillStyle = '#8a8f98';
    ctx.beginPath(); ctx.ellipse(0, 4 + b, 12, 10, 0, 0, Math.PI * 2); ctx.fill();       // Körper
    ctx.beginPath(); ctx.arc(6, -6 + b, 7, 0, Math.PI * 2); ctx.fill();                   // Kopf
    ctx.beginPath(); ctx.moveTo(2, -11 + b); ctx.lineTo(4, -17 + b); ctx.lineTo(7, -11 + b); // Ohren
    ctx.moveTo(9, -11 + b); ctx.lineTo(11, -17 + b); ctx.lineTo(13, -11 + b); ctx.fill();
    ctx.strokeStyle = '#8a8f98'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-11, 4 + b); ctx.quadraticCurveTo(-18, -2 + b, -14, -8 + b); ctx.stroke(); // Schwanz
    ctx.fillStyle = PALETTE.crystal; ctx.beginPath(); ctx.arc(4, -6 + b, 1.6, 0, 7); ctx.arc(9, -6 + b, 1.6, 0, 7); ctx.fill(); // Augen
    // "miau"
    ctx.fillStyle = 'rgba(244,233,214,0.9)'; ctx.font = '600 10px system-ui'; ctx.fillText('miau', 12, -14 + b);
  }

  _fire(ctx) {
    if (this.done) { // gelöscht: Rauch
      ctx.fillStyle = 'rgba(150,160,175,0.4)';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(i * 4 - 4, -6 - i * 5 + Math.sin(this.t * 2 + i), 5 - i, 0, 7); ctx.fill(); }
      return;
    }
    const flick = 0.85 + Math.sin(this.t * 14) * 0.15;
    const s = this.hp * flick;
    // Glut
    const g = ctx.createRadialGradient(0, 6, 2, 0, 6, 30 * s);
    g.addColorStop(0, 'rgba(255,170,60,0.7)'); g.addColorStop(1, 'rgba(255,90,20,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 6, 30 * s, 0, 7); ctx.fill();
    // Flammen
    flame(ctx, 0, 10, 16 * s, 30 * s, '#F5C560');
    flame(ctx, -5, 10, 11 * s, 22 * s, '#E8722B');
    flame(ctx, 6, 10, 10 * s, 20 * s, '#E8556B');
    // Lösch-Balken
    if (this.hp < 1) { ctx.fillStyle = 'rgba(8,16,28,0.8)'; ctx.fillRect(-16, 18, 32, 5); ctx.fillStyle = PALETTE.crystal; ctx.fillRect(-16, 18, 32 * (1 - this.hp), 5); }
  }

  _thief(ctx) {
    if (this.done) { ctx.fillStyle = '#5ED17A'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.fill(); ctx.strokeStyle = '#0B1424'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-1, 5); ctx.lineTo(6, -5); ctx.stroke(); return; }
    const run = Math.sin(this.t * 16) * 3;
    ctx.fillStyle = '#4b535e';
    ctx.beginPath(); ctx.ellipse(0, 2, 12, 14, 0, 0, Math.PI * 2); ctx.fill();  // Körper
    ctx.beginPath(); ctx.arc(0, -12, 9, 0, 7); ctx.fill();                       // Kopf
    ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(-4, -25); ctx.lineTo(0, -18); ctx.moveTo(0, -18); ctx.lineTo(4, -25); ctx.lineTo(8, -18); ctx.fill(); // Ohren
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(-9, -14, 18, 5);            // Maske
    ctx.fillStyle = '#C9A227'; ctx.beginPath(); ctx.arc(-4, -12, 1.6, 0, 7); ctx.arc(4, -12, 1.6, 0, 7); ctx.fill();
    ctx.fillStyle = '#3a4048'; ctx.fillRect(-10, 12 + run, 5, 8); ctx.fillRect(5, 12 - run, 5, 8); // Beine
    // Beutesack
    ctx.fillStyle = '#6b5a2a'; ctx.beginPath(); ctx.arc(11, 0, 6, 0, 7); ctx.fill();
  }
}

function flame(ctx, x, y, w, h, color) {
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(x, y); ctx.quadraticCurveTo(x - w, y - h * 0.5, x, y - h);
  ctx.quadraticCurveTo(x + w, y - h * 0.5, x, y); ctx.fill();
}
