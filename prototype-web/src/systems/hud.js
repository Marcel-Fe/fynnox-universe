// HUD nach dem Mockup-Layout (design/ui-mockups/): Avatar+Level, Herzen, XP-Leiste,
// Muenzen/Kristalle mit +, Zahnrad, Minimap, Missions-Panel, Gadget-Schnellleiste 1-5.
// Alles per Canvas gezeichnet (keine Assets noetig). Kanon: ../../kontext.md §13.
import { PALETTE } from '../../data/characters.js';

const GOLD = PALETTE.gold, GOLDL = PALETTE.goldLight, CRY = PALETTE.crystal;
const PANEL = 'rgba(14,26,43,0.78)', BORDER = 'rgba(233,169,59,0.55)';

// Bilder, die das HUD aus den Daten bekommt (z. B. Avatar), werden hier einmal geladen.
const images = {};
function image(src) {
  if (!src) return null;
  if (!(src in images)) { const im = new Image(); im.onload = () => { images[src] = im; }; im.src = src; images[src] = null; }
  return images[src];
}

export class HUD {
  constructor(state) { this.state = state; }

  // W/H = logische Spielfläche (nicht die Pixelgröße des Canvas).
  render(ctx, W = 960, H = 540) {
    const s = this.state;
    this._viewH = H;
    ctx.textBaseline = 'middle';

    this._topLeft(ctx, s);
    this._currencies(ctx, W, s);
    this._minimap(ctx, W, s);
    this._mission(ctx, W, s);
    this._gadgets(ctx, W, s);
    this._dayNight(ctx, W, s);
    if (s.boss && s.boss.active) this._boss(ctx, W, s.boss);
  }

  // Boss-Lebensbalken (Segmente) mittig unter der Tag/Nacht-Anzeige
  _boss(ctx, W, b) {
    const w = 260, x = (W - w) / 2, y = 52;
    text(ctx, b.name, W / 2, y - 4, '#C77BFF', '800 14px', 'center');
    const segW = (w - (b.maxHp - 1) * 6) / b.maxHp;
    for (let i = 0; i < b.maxHp; i++) {
      const sx = x + i * (segW + 6);
      roundRectPath(ctx, sx, y + 4, segW, 12, 4);
      ctx.fillStyle = i < b.hp ? '#C77BFF' : 'rgba(60,40,90,0.6)'; ctx.fill();
      ctx.strokeStyle = 'rgba(200,150,255,0.5)'; ctx.lineWidth = 1; roundRectPath(ctx, sx, y + 4, segW, 12, 4); ctx.stroke();
    }
  }

  // Avatar + Name + Level + Herzen + XP
  _topLeft(ctx, s) {
    const cx = 40, cy = 42, r = 24;
    // Avatar-Ring + Kopfbild aus den Daten (fehlt es, wird das Gesicht gezeichnet)
    ring(ctx, cx, cy, r, GOLD, PANEL);
    const face = image(s.avatar);
    if (face) {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r - 2, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(face, cx - r + 2, cy - r + 2, (r - 2) * 2, (r - 2) * 2);
      ctx.restore();
    } else drawFoxFace(ctx, cx, cy, r - 4);
    // Level-Badge
    circle(ctx, cx + r - 4, cy + r - 6, 11, '#1B2C48', GOLD);
    text(ctx, String(s.level), cx + r - 4, cy + r - 5, GOLDL, '700 12px', 'center');

    // Name
    text(ctx, s.name, 74, 22, '#F4E9D6', '800 16px');
    // Herzen
    for (let i = 0; i < s.maxHearts; i++) heart(ctx, 80 + i * 22, 42, 8, i < s.hearts ? '#E8556B' : 'rgba(255,255,255,0.18)');
    // XP-Leiste
    const xpW = 150, xpX = 74, xpY = 58;
    bar(ctx, xpX, xpY, xpW, 7, s.xp / s.xpMax, CRY);
    text(ctx, `XP ${fmt(s.xp)} / ${fmt(s.xpMax)}`, xpX + xpW + 8, xpY + 3, '#9db4d4', '600 11px');
  }

  // Muenzen + Kristalle (mit +) + Zahnrad
  _currencies(ctx, W, s) {
    const gearR = 16, gx = W - 26;
    const cW = 118, gap = 8;
    const crystalX = gx - gearR - 10 - cW;
    const coinX = crystalX - gap - cW;

    pill(ctx, coinX, 14, cW, 32);
    coin(ctx, coinX + 18, 30);
    text(ctx, fmt(s.coins), coinX + 34, 31, GOLDL, '700 15px');
    plus(ctx, coinX + cW - 16, 30);

    pill(ctx, crystalX, 14, cW, 32);
    miniCrystal(ctx, crystalX + 18, 30);
    text(ctx, fmt(s.crystals), crystalX + 32, 31, CRY, '700 15px');
    plus(ctx, crystalX + cW - 16, 30);

    circle(ctx, gx, 30, gearR, PANEL, BORDER);
    gear(ctx, gx, 30, 8);
  }

  // Runde Minimap oben rechts mit Pins + Spielerpunkt
  _minimap(ctx, W, s) {
    const r = 34, cx = W - 26 - r + 16, cy = 60 + r;
    circle(ctx, cx, cy, r, 'rgba(8,16,28,0.85)', BORDER);
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r - 2, 0, Math.PI * 2); ctx.clip();
    // Straßenraster
    ctx.strokeStyle = 'rgba(120,150,190,0.18)'; ctx.lineWidth = 1;
    for (let i = -r; i < r; i += 10) { line(ctx, cx - r, cy + i, cx + r, cy + i); line(ctx, cx + i, cy - r, cx + i, cy + r); }
    // Pins (Kristalle)
    for (const p of s.map.pins) {
      const px = cx - r + 4 + p.x * (2 * r - 8);
      dot(ctx, px, cy + (p.y - 0.5) * (r), 2.4, p.collected ? 'rgba(120,140,160,0.6)' : CRY);
    }
    // Spieler
    dot(ctx, cx - r + 4 + s.map.px * (2 * r - 8), cy + 6, 3.4, GOLDL);
    ctx.restore();
  }

  // Missions-Panel (rechts)
  _mission(ctx, W, s) {
    const m = s.mission, w = 210, x = W - 26 - w, y = 108, h = 66;
    roundRectPath(ctx, x, y, w, h, 10); ctx.fillStyle = PANEL; ctx.fill();
    ctx.strokeStyle = BORDER; ctx.lineWidth = 1.5; roundRectPath(ctx, x, y, w, h, 10); ctx.stroke();
    text(ctx, m.type, x + 14, y + 16, GOLDL, '800 12px');
    text(ctx, m.title, x + 14, y + 36, '#F4E9D6', '600 14px');
    miniCrystal(ctx, x + 20, y + 52);
    text(ctx, `${m.have} / ${m.need}`, x + 34, y + 53, '#b9c9de', '600 12px');
  }

  // Gadget-Schnellleiste unten Mitte (5 Slots + Labels)
  _gadgets(ctx, W, s) {
    const n = s.gadgets.length, slot = 54, gap = 10, totalW = n * slot + (n - 1) * gap;
    let x = (W - totalW) / 2, y = (this._viewH || 540) - 66;
    s.gadgets.forEach((g, i) => {
      roundRectPath(ctx, x, y, slot, slot, 10); ctx.fillStyle = PANEL; ctx.fill();
      ctx.strokeStyle = i === s.activeGadget ? GOLDL : BORDER; ctx.lineWidth = i === s.activeGadget ? 2.5 : 1.4;
      roundRectPath(ctx, x, y, slot, slot, 10); ctx.stroke();
      gadgetIcon(ctx, g, x + slot / 2, y + slot / 2 - 3);
      // Nummer
      circle(ctx, x + slot - 12, y + slot - 12, 8, '#1B2C48', BORDER);
      text(ctx, String(i + 1), x + slot - 12, y + slot - 11, '#F4E9D6', '700 10px', 'center');
      // Label
      text(ctx, g, x + slot / 2, y + slot + 9, '#9db4d4', '600 9px', 'center');
      x += slot + gap;
    });
  }

  _dayNight(ctx, W, s) {
    pill(ctx, W / 2 - 55, 14, 110, 26);
    text(ctx, s.isDay ? '☀  TAG' : '☾  NACHT', W / 2, 27, GOLDL, '700 13px', 'center');
  }
}

// ---- Zeichen-Helfer ----
function fmt(n) { return n.toLocaleString('de-DE'); }
function text(ctx, str, x, y, color, font, align = 'left') { ctx.font = font + ' system-ui, sans-serif'; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(str, x, y); ctx.textAlign = 'left'; }
function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
function dot(ctx, x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function circle(ctx, x, y, r, fill, stroke) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.6; ctx.stroke(); } }
function ring(ctx, x, y, r, stroke, fill) { circle(ctx, x, y, r, fill, stroke); ctx.lineWidth = 2.5; ctx.strokeStyle = stroke; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); }

function pill(ctx, x, y, w, h) { roundRectPath(ctx, x, y, w, h, h / 2); ctx.fillStyle = PANEL; ctx.fill(); ctx.strokeStyle = BORDER; ctx.lineWidth = 1.5; roundRectPath(ctx, x, y, w, h, h / 2); ctx.stroke(); }
function bar(ctx, x, y, w, h, pct, color) { roundRectPath(ctx, x, y, w, h, h / 2); ctx.fillStyle = 'rgba(8,16,28,0.8)'; ctx.fill(); roundRectPath(ctx, x, y, Math.max(h, w * Math.max(0, Math.min(1, pct))), h, h / 2); ctx.fillStyle = color; ctx.fill(); }
function plus(ctx, x, y) { circle(ctx, x, y, 9, GOLD); ctx.strokeStyle = '#23180a'; ctx.lineWidth = 2; line(ctx, x - 4, y, x + 4, y); line(ctx, x, y - 4, x, y + 4); }
function coin(ctx, x, y) { circle(ctx, x, y, 9, GOLD); circle(ctx, x, y, 5, GOLDL); }
function miniCrystal(ctx, x, y) { ctx.fillStyle = CRY; ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x + 6, y - 1); ctx.lineTo(x, y + 9); ctx.lineTo(x - 6, y - 1); ctx.closePath(); ctx.fill(); }
function gear(ctx, x, y, r) { ctx.fillStyle = GOLDL; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.save(); ctx.translate(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.fillRect(-1.5, -1.5, 3, 3); ctx.restore(); } circle(ctx, x, y, r * 0.7, GOLDL); circle(ctx, x, y, r * 0.32, PANEL); }

function heart(ctx, x, y, r, color) {
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(x, y + r * 0.35);
  ctx.bezierCurveTo(x, y - r * 0.5, x - r, y - r * 0.5, x - r, y + r * 0.1);
  ctx.bezierCurveTo(x - r, y + r * 0.6, x, y + r, x, y + r * 1.1);
  ctx.bezierCurveTo(x, y + r, x + r, y + r * 0.6, x + r, y + r * 0.1);
  ctx.bezierCurveTo(x + r, y - r * 0.5, x, y - r * 0.5, x, y + r * 0.35);
  ctx.fill();
}

// Kleines Fuchsgesicht im Avatar
function drawFoxFace(ctx, x, y, r) {
  ctx.fillStyle = PALETTE.orange;
  ctx.beginPath(); ctx.arc(x, y + 2, r * 0.8, 0, Math.PI * 2); ctx.fill();
  // Ohren
  ctx.beginPath(); ctx.moveTo(x - r * 0.7, y - r * 0.3); ctx.lineTo(x - r * 0.35, y - r * 0.95); ctx.lineTo(x - r * 0.05, y - r * 0.35); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + r * 0.7, y - r * 0.3); ctx.lineTo(x + r * 0.35, y - r * 0.95); ctx.lineTo(x + r * 0.05, y - r * 0.35); ctx.closePath(); ctx.fill();
  // Schnauze
  ctx.fillStyle = PALETTE.cream; ctx.beginPath(); ctx.ellipse(x, y + r * 0.35, r * 0.4, r * 0.32, 0, 0, Math.PI * 2); ctx.fill();
  // Goggles
  ctx.fillStyle = CRY; ctx.beginPath(); ctx.arc(x - r * 0.28, y - r * 0.05, r * 0.22, 0, Math.PI * 2); ctx.arc(x + r * 0.28, y - r * 0.05, r * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2A1B14'; ctx.beginPath(); ctx.arc(x, y + r * 0.5, r * 0.12, 0, Math.PI * 2); ctx.fill();
}

// Sehr einfache Gadget-Piktogramme (Platzhalter, klar unterscheidbar)
function gadgetIcon(ctx, name, x, y) {
  ctx.strokeStyle = GOLDL; ctx.fillStyle = GOLDL; ctx.lineWidth = 2;
  ctx.save(); ctx.translate(x, y);
  switch (name) {
    case 'Scanner': circle(ctx, 0, 0, 8, null, CRY); dot(ctx, 0, 0, 2, CRY); break;
    case 'Greifhaken': line(ctx, -7, -7, 3, 3); ctx.beginPath(); ctx.arc(5, 5, 4, Math.PI, Math.PI * 2.4); ctx.stroke(); break;
    case 'Rauchkapsel': roundRectPath(ctx, -5, -8, 10, 16, 4); ctx.strokeStyle = CRY; ctx.stroke(); break;
    case 'Multitool': line(ctx, -7, 6, 6, -7); line(ctx, -7, -7, -3, -3); line(ctx, 6, 6, 2, 2); break;
    case 'Drohne': dot(ctx, 0, 0, 3, GOLDL); circle(ctx, -7, -4, 3, null, GOLDL); circle(ctx, 7, -4, 3, null, GOLDL); break;
    default: circle(ctx, 0, 0, 7, null, GOLDL);
  }
  ctx.restore();
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
