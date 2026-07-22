// Tag/Nacht-Umschaltung (Kernmechanik). Blendet weich zwischen zwei Themes.
// t = 0 -> Nacht (Nachtwächter, Standard), t = 1 -> Tag.

export class DayNight {
  constructor(level) {
    this.themes = level.themes;
    this.t = 0;            // aktueller Mischwert
    this.target = 0;       // Zielwert
    this.isDay = false;
  }

  toggle() { this.isDay = !this.isDay; this.target = this.isDay ? 1 : 0; }

  update(dt) {
    const speed = 2.5;
    if (this.t < this.target) this.t = Math.min(this.target, this.t + dt * speed);
    else if (this.t > this.target) this.t = Math.max(this.target, this.t - dt * speed);
  }

  // Aktuelles Theme als Interpolation der beiden Kanon-Themes.
  theme() {
    const n = this.themes.night, d = this.themes.day, t = this.t;
    return {
      skyTop: mix(n.skyTop, d.skyTop, t),
      skyBottom: mix(n.skyBottom, d.skyBottom, t),
      buildingBack: mix(n.buildingBack, d.buildingBack, t),
      buildingMid: mix(n.buildingMid, d.buildingMid, t),
      buildingFront: mix(n.buildingFront, d.buildingFront, t),
      windowGlow: t < 0.5 ? n.windowGlow : d.windowGlow,
      ground: mix(n.ground, d.ground, t),
      groundTop: mix(n.groundTop, d.groundTop, t),
      moonAlpha: 1 - t,   // Mond nachts sichtbar
      sunAlpha: t,        // Sonne tags sichtbar
    };
  }
}

function hexToRgb(h) {
  const v = parseInt(h.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
function mix(h1, h2, t) {
  const a = hexToRgb(h1), b = hexToRgb(h2);
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}
