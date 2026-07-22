// HUD im Kanon-Layout: Herzen (Leben) links, Kristalle (türkis) + Münzen (gold) rechts.
import { PALETTE } from '../../data/characters.js';

export class HUD {
  constructor(state) { this.state = state; } // state: { maxHearts, hearts, crystals, coins, isDay }

  render(ctx) {
    const s = this.state;
    // Herzen
    for (let i = 0; i < s.maxHearts; i++) {
      drawHeart(ctx, 24 + i * 30, 26, 11, i < s.hearts ? '#E8556B' : 'rgba(255,255,255,0.18)');
    }

    // rechte Zähler-Pille
    const W = ctx.canvas.width;
    drawPill(ctx, W - 250, 14, 110, 30);
    drawPill(ctx, W - 130, 14, 110, 30);

    // Kristall-Icon + Zahl
    drawMiniCrystal(ctx, W - 234, 29);
    text(ctx, format(s.crystals), W - 218, 34, PALETTE.crystal);

    // Münz-Icon + Zahl
    drawCoin(ctx, W - 114, 29);
    text(ctx, format(s.coins), W - 98, 34, PALETTE.goldLight);

    // Tag/Nacht-Anzeige
    drawPill(ctx, W / 2 - 55, 14, 110, 26);
    text(ctx, s.isDay ? '☀  TAG' : '☾  NACHT', W / 2 - 38, 32, PALETTE.goldLight, '13px');
  }
}

function format(n) { return n.toLocaleString('de-DE'); }

function text(ctx, str, x, y, color, size = '15px') {
  ctx.font = `600 ${size} system-ui, sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function drawPill(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(14,26,43,0.72)';
  rr(ctx, x, y, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = 'rgba(233,169,59,0.55)'; ctx.lineWidth = 1.5;
  rr(ctx, x, y, w, h, h / 2); ctx.stroke();
}

function drawHeart(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.35);
  ctx.bezierCurveTo(x, y - r * 0.5, x - r, y - r * 0.5, x - r, y + r * 0.1);
  ctx.bezierCurveTo(x - r, y + r * 0.6, x, y + r, x, y + r * 1.1);
  ctx.bezierCurveTo(x, y + r, x + r, y + r * 0.6, x + r, y + r * 0.1);
  ctx.bezierCurveTo(x + r, y - r * 0.5, x, y - r * 0.5, x, y + r * 0.35);
  ctx.fill();
}

function drawMiniCrystal(ctx, x, y) {
  ctx.fillStyle = PALETTE.crystal;
  ctx.beginPath();
  ctx.moveTo(x, y - 9); ctx.lineTo(x + 6, y - 1); ctx.lineTo(x, y + 9); ctx.lineTo(x - 6, y - 1);
  ctx.closePath(); ctx.fill();
}

function drawCoin(ctx, x, y) {
  ctx.fillStyle = PALETTE.gold;
  ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PALETTE.goldLight;
  ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
