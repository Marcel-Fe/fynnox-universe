// Sehr schlanker Szenen-/Zustands-Manager: 'menu' <-> 'play'.
// Hält den aktuellen Modus und benachrichtigt bei Wechsel.

export class SceneManager {
  constructor(initial = 'menu') {
    this.current = initial;
    this._listeners = [];
  }
  on(cb) { this._listeners.push(cb); }
  go(to) {
    if (to === this.current) return;
    const from = this.current;
    this.current = to;
    for (const cb of this._listeners) cb(to, from);
  }
  is(state) { return this.current === state; }
}
