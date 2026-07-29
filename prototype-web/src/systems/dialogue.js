// Comic-Dialog-System (Kanon §13): Sprechblase unten, Portrait, Name, Text, "Weiter".
// Friert das Gameplay ein, solange aktiv. Weiter mit Aktion (E / Pfote / Klick).
import { PALETTE } from '../../data/characters.js';

export class Dialogue {
  constructor() {
    this.active = false;
    this.frames = [];
    this.index = 0;
    this.onDone = null;
    this.charTimer = 0; // Schreibmaschinen-Effekt
  }

  start(frames, onDone) {
    if (!frames || frames.length === 0) { if (onDone) onDone(); return; }
    this.frames = frames;
    this.index = 0;
    this.onDone = onDone || null;
    this.active = true;
    this.charTimer = 0;
  }

  advance() {
    const full = this.frames[this.index].text.length;
    if (this.charTimer < full) { this.charTimer = full; return; } // erst Text komplett zeigen
    this.index++;
    this.charTimer = 0;
    if (this.index >= this.frames.length) {
      this.active = false;
      const cb = this.onDone; this.onDone = null;
      if (cb) cb();
    }
  }

  update(input, dt) {
    if (!this.active) return;
    this.charTimer += dt * 45; // Zeichen pro Sekunde
    if (input.pressed.action) this.advance();
  }

  render(ctx) {
    if (!this.active) return;
    const W = ctx.canvas.width, H = ctx.canvas.height;
    const f = this.frames[this.index];

    // Abdunkeln
    ctx.fillStyle = 'rgba(6,11,20,0.45)';
    ctx.fillRect(0, 0, W, H);

    // Panel
    const x = 40, w = W - 80, h = 118, y = H - h - 22;
    rr(ctx, x, y, w, h, 14); ctx.fillStyle = 'rgba(14,26,43,0.96)'; ctx.fill();
    ctx.strokeStyle = PALETTE.gold; ctx.lineWidth = 2; rr(ctx, x, y, w, h, 14); ctx.stroke();

    // Portrait
    const pr = 40, pcx = x + pr + 12, pcy = y + h / 2;
    ctx.beginPath(); ctx.arc(pcx, pcy, pr, 0, Math.PI * 2); ctx.fillStyle = '#0B1424'; ctx.fill();
    ctx.strokeStyle = PALETTE.gold; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(pcx, pcy, pr - 2, 0, Math.PI * 2); ctx.clip();
    drawPortrait(ctx, f.portrait, pcx, pcy, pr);
    ctx.restore();

    // Name
    const tx = x + 2 * pr + 34;
    ctx.font = '800 18px system-ui, sans-serif'; ctx.fillStyle = PALETTE.goldLight; ctx.textBaseline = 'alphabetic';
    ctx.fillText(f.speaker, tx, y + 34);

    // Text (Schreibmaschine, Zeilenumbruch)
    const shown = f.text.slice(0, Math.floor(this.charTimer));
    ctx.font = '400 16px system-ui, sans-serif'; ctx.fillStyle = '#EAF1FB';
    wrapText(ctx, shown, tx, y + 60, w - (tx - x) - 30, 22);

    // Weiter-Hinweis
    ctx.font = '600 13px system-ui, sans-serif'; ctx.fillStyle = '#9db4d4';
    ctx.textAlign = 'right';
    const done = this.charTimer >= f.text.length;
    ctx.fillText(done ? '▶ Weiter (E / Pfote)' : '…', x + w - 16, y + h - 14);
    ctx.textAlign = 'left';
  }
}

// Klick/Tap zählt auch als "Weiter" — in main.js an Canvas gebunden.
export function bindDialogueClick(canvas, dialogue) {
  canvas.addEventListener('pointerdown', () => { if (dialogue.active) dialogue.advance(); });
}

function wrapText(ctx, text, x, y, maxW, lh) {
  const words = text.split(' ');
  let line = '', yy = y;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, yy); line = word + ' '; yy += lh; }
    else line = test;
  }
  ctx.fillText(line, x, yy);
}

// Stilisierte Portraits (Platzhalter). Farben nach Kanon-Spezies.
function drawPortrait(ctx, who, x, y, r) {
  const P = PALETTE;
  const base = { fynnox: P.orange, orion: '#8a6a44', raven: '#E7ECF2', bo: '#7a5233', thief: '#5c6570' }[who] || P.orange;
  ctx.fillStyle = '#12233a'; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  // Kopf
  ctx.fillStyle = base; ctx.beginPath(); ctx.arc(x, y + 4, r * 0.72, 0, Math.PI * 2); ctx.fill();
  // Ohren
  ctx.beginPath();
  if (who === 'orion' || who === 'raven') { // Eulen: Federohren
    ctx.moveTo(x - r * 0.55, y - r * 0.2); ctx.lineTo(x - r * 0.3, y - r * 0.85); ctx.lineTo(x - r * 0.05, y - r * 0.25);
    ctx.moveTo(x + r * 0.55, y - r * 0.2); ctx.lineTo(x + r * 0.3, y - r * 0.85); ctx.lineTo(x + r * 0.05, y - r * 0.25);
  } else { // Fuchs/Bär/Waschbär
    ctx.moveTo(x - r * 0.6, y - r * 0.25); ctx.lineTo(x - r * 0.3, y - r * 0.85); ctx.lineTo(x - r * 0.02, y - r * 0.3);
    ctx.moveTo(x + r * 0.6, y - r * 0.25); ctx.lineTo(x + r * 0.3, y - r * 0.85); ctx.lineTo(x + r * 0.02, y - r * 0.3);
  }
  ctx.fill();
  // Schnauze/Brust hell
  ctx.fillStyle = who === 'raven' ? '#cfd8e6' : P.cream;
  ctx.beginPath(); ctx.ellipse(x, y + r * 0.35, r * 0.4, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
  // Augen
  const eyeC = who === 'thief' ? '#C9A227' : (who === 'fynnox' ? P.crystal : '#3a5a86');
  ctx.fillStyle = eyeC;
  ctx.beginPath(); ctx.arc(x - r * 0.24, y - r * 0.02, r * 0.14, 0, Math.PI * 2); ctx.arc(x + r * 0.24, y - r * 0.02, r * 0.14, 0, Math.PI * 2); ctx.fill();
  // Fynnox: Goggles-Riemen
  if (who === 'fynnox') { ctx.strokeStyle = P.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - r * 0.5, y - r * 0.1); ctx.lineTo(x + r * 0.5, y - r * 0.12); ctx.stroke(); }
  // Dieb: Augenmaske
  if (who === 'thief') { ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(x - r * 0.5, y - r * 0.18, r, r * 0.28); }
  ctx.fillStyle = '#1a1008';
  ctx.beginPath(); ctx.arc(x, y + r * 0.4, r * 0.1, 0, Math.PI * 2); ctx.fill(); // Nase
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
