// Missions-Manager: steuert die Story-Kette. Zeigt Intro-Dialog → aktiviert Ziel →
// prüft Fortschritt → Belohnung + Outro-Dialog → nächste Mission. Alles datengetrieben.
import { Interactable } from '../entities/interactable.js';

export class MissionManager {
  constructor(missions, { dialogue, hud, getCollected }) {
    this.missions = missions;
    this.dialogue = dialogue;
    this.hud = hud;
    this.getCollected = getCollected; // () => Anzahl eingesammelter Kristalle
    this.index = -1;
    this.state = 'idle';              // idle | intro | active | outro | done
    this.entities = [];
    this.collectBaseline = 0;
  }

  start() { this.index = 0; this._begin(); }

  _begin() {
    const m = this.missions[this.index];
    this.state = 'intro';
    this.entities = [];
    this.dialogue.start(m.intro, () => this._activate(m));
  }

  _activate(m) {
    this.state = 'active';
    this.entities = (m.entities || []).map((e) => new Interactable(e));
    this.collectBaseline = this.getCollected();
    const need = m.objective.kind === 'collect' ? m.objective.need : this.entities.length;
    this.hud.mission = { type: m.type, title: m.title, text: m.objective.text, have: 0, need };
  }

  update(player, input, dt) {
    if (this.state !== 'active') return;
    const m = this.missions[this.index];

    for (const e of this.entities) e.update(dt, player, input);

    let have, need;
    if (m.objective.kind === 'collect') {
      need = m.objective.need;
      have = Math.min(need, this.getCollected() - this.collectBaseline);
    } else {
      need = this.entities.length;
      have = this.entities.filter((e) => e.done).length;
    }
    this.hud.mission.have = have;
    this.hud.mission.need = need;

    if (have >= need) this._complete(m);
  }

  _complete(m) {
    this.state = 'outro';
    // Belohnung
    const r = m.reward || {};
    this.hud.coins += r.coins || 0;
    this.hud.crystals += r.crystals || 0;
    this.hud.xp += r.xp || 0;
    while (this.hud.xp >= this.hud.xpMax) { this.hud.xp -= this.hud.xpMax; this.hud.level += 1; }

    this.dialogue.start(m.outro, () => {
      this.index += 1;
      if (this.index < this.missions.length) this._begin();
      else this._finish();
    });
  }

  _finish() {
    this.state = 'done';
    this.entities = [];
    this.hud.mission = { type: 'ABGESCHLOSSEN', title: 'Band 0 – Kapitel 1 geschafft!', text: 'Alle Einsätze erledigt', have: 1, need: 1 };
  }

  render(ctx, camera) { for (const e of this.entities) e.render(ctx, camera); }
}
