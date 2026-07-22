// Eingabe-Abstraktion: Tastatur + Touch schreiben in dieselben logischen Aktionen.
// Gameplay-Code fragt nur Aktionen ab und kennt keine konkrete Taste.

const KEY_MAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
  KeyE: 'action',
  KeyN: 'toggleDayNight',
};

export class Input {
  constructor() {
    this.actions = { left: false, right: false, jump: false, action: false, toggleDayNight: false };
    // "pressed" = nur der eine Frame, in dem die Aktion neu gedrückt wurde (für Sprung).
    this.pressed = { jump: false, toggleDayNight: false, action: false };
    this._down = new Set();
  }

  attach(touchButtons) {
    window.addEventListener('keydown', (e) => {
      const a = KEY_MAP[e.code];
      if (!a) return;
      e.preventDefault();
      if (!this._down.has(a)) this._markPressed(a);
      this._down.add(a);
      this.actions[a] = true;
    });
    window.addEventListener('keyup', (e) => {
      const a = KEY_MAP[e.code];
      if (!a) return;
      this._down.delete(a);
      this.actions[a] = false;
    });

    // Touch/Maus-Buttons (mobil-freundlich). touchButtons = { id: action }
    for (const [id, action] of Object.entries(touchButtons || {})) {
      const el = document.getElementById(id);
      if (!el) continue;
      const press = (e) => { e.preventDefault(); this._markPressed(action); this.actions[action] = true; el.classList.add('active'); };
      const release = (e) => { e.preventDefault(); this.actions[action] = false; el.classList.remove('active'); };
      el.addEventListener('pointerdown', press);
      el.addEventListener('pointerup', release);
      el.addEventListener('pointerleave', release);
      el.addEventListener('pointercancel', release);
    }
  }

  _markPressed(a) { if (a in this.pressed) this.pressed[a] = true; }

  // Am Ende jedes Update-Schritts aufrufen: löscht die Einmal-Flags.
  endFrame() { for (const k in this.pressed) this.pressed[k] = false; }
}
