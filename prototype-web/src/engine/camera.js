// Kamera: folgt dem Ziel weich und begrenzt sich auf die Levelgrenzen.
// Für Parallax liefert sie parallaxX(): die um einen Faktor reduzierte Verschiebung.

export class Camera {
  constructor(viewW, viewH) {
    this.viewW = viewW;
    this.viewH = viewH;
    this.x = 0;
    this.y = 0;
    this.worldW = viewW;
    this.worldH = viewH;
  }

  setBounds(worldW, worldH) { this.worldW = worldW; this.worldH = worldH; }

  follow(targetX, targetY, dt) {
    const desiredX = targetX - this.viewW * 0.4;   // Held etwas links der Mitte
    const desiredY = targetY - this.viewH * 0.6;
    // weiches Nachziehen
    this.x += (desiredX - this.x) * Math.min(1, dt * 6);
    this.y += (desiredY - this.y) * Math.min(1, dt * 6);
    this._clamp();
  }

  _clamp() {
    this.x = Math.max(0, Math.min(this.x, this.worldW - this.viewW));
    this.y = Math.max(0, Math.min(this.y, this.worldH - this.viewH));
  }

  parallaxX(factor) { return this.x * factor; }
}
