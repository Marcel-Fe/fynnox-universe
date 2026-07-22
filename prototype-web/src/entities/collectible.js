// Sammelobjekt (aktuell: Kristall). Schwebt/dreht leicht, wird eingesammelt.
import { PALETTE } from '../../data/characters.js';

export class Collectible {
  constructor(data) {
    this.type = data.type;
    this.x = data.x;
    this.y = data.y;
    this.w = 22;
    this.h = 30;
    this.baseY = data.y;
    this.t = Math.random() * Math.PI * 2; // Phasenversatz fürs Schweben
    this.collected = false;
  }

  update(dt) {
    if (this.collected) return;
    this.t += dt * 3;
    this.y = this.baseY + Math.sin(this.t) * 6;
  }

  render(ctx, camera) {
    if (this.collected) return;
    const sx = this.x - camera.x, sy = this.y - camera.y;
    if (sx < -40 || sx > ctx.canvas.width + 40) return;

    ctx.save();
    ctx.translate(sx + this.w / 2, sy + this.h / 2);
    // Schein
    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
    glow.addColorStop(0, 'rgba(47,211,224,0.55)');
    glow.addColorStop(1, 'rgba(47,211,224,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fill();

    // Kristall (Raute)
    ctx.fillStyle = PALETTE.crystal;
    ctx.beginPath();
    ctx.moveTo(0, -15); ctx.lineTo(9, -2); ctx.lineTo(0, 15); ctx.lineTo(-9, -2);
    ctx.closePath(); ctx.fill();
    // Glanzkante
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.moveTo(0, -15); ctx.lineTo(9, -2); ctx.lineTo(0, -2);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
