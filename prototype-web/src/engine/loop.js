// Game-Loop mit festem Zeitschritt (Fixed Timestep).
// Physik/Update laufen in gleich großen Schritten -> gleiche Geschwindigkeit auf
// schnellen und langsamen Geräten. Rendern passiert einmal pro Frame.

const STEP = 1 / 60; // Sekunden pro Physikschritt

export class GameLoop {
  constructor(update, render) {
    this.update = update;   // (dt) => void
    this.render = render;   // () => void
    this.accumulator = 0;
    this.last = 0;
    this.running = false;
    this._frame = this._frame.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this._frame);
  }

  stop() { this.running = false; }

  _frame(now) {
    if (!this.running) return;
    let delta = (now - this.last) / 1000;
    this.last = now;
    // Schutz gegen große Sprünge (z. B. Tab-Wechsel): max. 0,25 s aufholen.
    if (delta > 0.25) delta = 0.25;

    this.accumulator += delta;
    while (this.accumulator >= STEP) {
      this.update(STEP);
      this.accumulator -= STEP;
    }
    this.render();
    requestAnimationFrame(this._frame);
  }
}
