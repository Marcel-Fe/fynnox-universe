// Spielstand-Speicher: EINZIGER Ort im Projekt, der localStorage anfasst.
// Reines Datenmodul — kennt weder Player noch HUD noch Level: es bekommt ein
// einfaches Objekt und gibt eins zurück. Was drin steht, entscheidet main.js.
//
// Versionierung: Ändert sich das Schema, wird VERSION erhöht. Alte Stände passen
// dann nicht mehr und werden verworfen (load() -> null) statt das Spiel zu brechen.

const KEY = 'fynnox:save:v1';
const VERSION = 1;

// Speichert den Stand. Gibt true zurück, wenn es geklappt hat.
// Privatmodus oder voller Speicher darf das Spiel niemals abstürzen lassen.
export function save(state) {
  try {
    const payload = { ...state, version: VERSION, savedAt: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

// Liefert den Stand oder null (kein Stand, kaputt, falsche Version).
export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || data.version !== VERSION) return null;
    return data;
  } catch {
    return null;
  }
}

export function clear() {
  try { localStorage.removeItem(KEY); } catch { /* egal — dann bleibt der Stand eben liegen */ }
}

// Bewusst über load(): ein kaputter Stand gilt als "kein Stand".
export function hasSave() {
  return load() !== null;
}
