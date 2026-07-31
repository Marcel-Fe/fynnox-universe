// Kamera im Plattformer-Stil: eine Totzone um den Helden (kleine Bewegungen
// lassen das Bild ruhig), Vorausschau in Laufrichtung und ein vertikal träger
// Lauf, damit Sprünge das Bild nicht mitreißen. Grenzen: die Levelgröße.
// Für Parallax liefert sie parallaxX(): die um einen Faktor reduzierte Verschiebung.

const DEFAULTS = {
  anchorX: 0.42,     // Ruheposition des Helden im Bild (0 = links, 1 = rechts)
  anchorY: 0.60,
  deadX: 26,         // so weit darf er sich bewegen, ohne dass die Kamera folgt
  deadY: 72,
  lookAhead: 105,    // maximale Vorausschau in Laufrichtung (px)
  lookSpeed: 2.2,    // wie schnell die Vorausschau nachzieht
  leadMin: 0.35,     // erst ab diesem Tempo-Anteil überhaupt vorausschauen
  followX: 8,        // Nachziehgeschwindigkeit horizontal
  followGround: 6,   // vertikal am Boden
  followAir: 2.6,    // vertikal in der Luft (bewusst träger)
};

export class Camera {
  constructor(viewW, viewH) {
    this.viewW = viewW;
    this.viewH = viewH;
    this.x = 0;
    this.y = 0;
    this.worldW = viewW;
    this.worldH = viewH;
    this.look = 0;
    this.cfg = { ...DEFAULTS };
  }

  setBounds(worldW, worldH) { this.worldW = worldW; this.worldH = worldH; }

  // Optional pro Level anders (level.data.camera). Fehlende Werte bleiben Standard.
  configure(cfg) { Object.assign(this.cfg, cfg || {}); }

  // opts.lead: -1..1 (Laufrichtung/Tempo), opts.grounded: steht die Figur?
  follow(targetX, targetY, dt, opts = {}) {
    const c = this.cfg;

    // Langsames Antippen soll das Bild nicht verschieben — erst richtiges Laufen zählt.
    const lead = opts.lead || 0;
    const eff = Math.abs(lead) <= c.leadMin ? 0
      : Math.sign(lead) * (Math.abs(lead) - c.leadMin) / (1 - c.leadMin);
    const wantedLook = eff * c.lookAhead;
    this.look += (wantedLook - this.look) * Math.min(1, dt * c.lookSpeed);

    const desiredX = targetX + this.look - this.viewW * c.anchorX;
    const desiredY = targetY - this.viewH * c.anchorY;

    this.x += softStep(desiredX - this.x, c.deadX) * Math.min(1, dt * c.followX);
    const vSpeed = opts.grounded === false ? c.followAir : c.followGround;
    this.y += softStep(desiredY - this.y, c.deadY) * Math.min(1, dt * vSpeed);

    this._clamp();
  }

  // Bei Szenenwechsel/Respawn: sofort hinspringen, statt hinterherzufahren.
  snapTo(targetX, targetY) {
    this.look = 0;
    this.x = targetX - this.viewW * this.cfg.anchorX;
    this.y = targetY - this.viewH * this.cfg.anchorY;
    this._clamp();
  }

  _clamp() {
    this.x = Math.max(0, Math.min(this.x, this.worldW - this.viewW));
    this.y = Math.max(0, Math.min(this.y, this.worldH - this.viewH));
  }

  parallaxX(factor) { return this.x * factor; }
}

// Innerhalb der Totzone passiert nichts, außerhalb zieht nur der Überschuss.
function softStep(delta, dead) {
  if (Math.abs(delta) <= dead) return 0;
  return delta - Math.sign(delta) * dead;
}
