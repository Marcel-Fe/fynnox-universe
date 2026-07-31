// Missions-Manager: steuert die Story-Kette. Zeigt Intro-Dialog → aktiviert Ziel →
// prüft Fortschritt → Belohnung + Outro-Dialog → nächste Mission. Alles datengetrieben.
import { Interactable } from '../entities/interactable.js';
import { Boss } from '../entities/boss.js';

export class MissionManager {
  constructor(missions, { dialogue, hud, getCollected, onMissionDone }) {
    this.missions = missions;
    this.dialogue = dialogue;
    this.hud = hud;
    this.getCollected = getCollected; // () => Anzahl eingesammelter Kristalle
    this.onMissionDone = onMissionDone || null; // Checkpoint-Meldung nach Abschluss
    this.index = -1;
    this.state = 'idle';              // idle | intro | active | outro | done
    this.entities = [];
    this.boss = null;
    this.collectBaseline = 0;
  }

  start() { this.index = 0; this._begin(); }

  // Dev/Test + Spielstand: direkt zu Mission i springen (überspringt vorherige).
  // i wird begrenzt; i >= Anzahl bedeutet "alle Einsätze erledigt".
  skipTo(i) {
    this.dialogue.active = false;
    this.index = Math.max(0, Math.min(Math.floor(i) || 0, this.missions.length));
    if (this.index >= this.missions.length) this._finish();
    else this._begin();
  }

  _begin() {
    const m = this.missions[this.index];
    this.state = 'intro';
    this.entities = [];
    this.boss = null;
    this.hud.boss = { active: false };
    this.dialogue.start(m.intro, () => this._activate(m));
  }

  _activate(m) {
    this.state = 'active';
    this.collectBaseline = this.getCollected();
    if (m.objective.kind === 'boss') {
      this.boss = new Boss(m.entities[0]);
      this.entities = [];
      this.hud.boss = { active: true, name: m.entities[0].name, hp: this.boss.hp, maxHp: this.boss.maxHp };
      this.hud.mission = { type: m.type, title: m.title, text: m.objective.text, have: 0, need: 1 };
      return;
    }
    this.boss = null;
    this.hud.boss = { active: false };
    this.entities = (m.entities || []).map((e) => new Interactable(e));
    const need = m.objective.kind === 'collect' ? m.objective.need : this.entities.length;
    this.hud.mission = { type: m.type, title: m.title, text: m.objective.text, have: 0, need };
  }

  update(player, input, dt) {
    if (this.state !== 'active') return;
    const m = this.missions[this.index];

    // Boss-Kampf
    if (this.boss) {
      this.boss.update(dt, player, input);
      if (this.boss.playerHit && player.hurt(this.boss.lastHitDir)) {
        this.hud.hearts -= 1;
        if (this.hud.hearts <= 0) { this.hud.hearts = this.hud.maxHearts; this.boss.reset(); }
      }
      this.hud.boss.hp = this.boss.hp;
      this.hud.mission.have = this.boss.defeated ? 1 : 0;
      if (this.boss.defeated) { this.hud.boss.active = false; this._complete(m); }
      return;
    }

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
      // Erst jetzt ist der Fortschritt endgültig — guter Checkpoint zum Speichern.
      if (this.onMissionDone) this.onMissionDone(this.index);
    });
  }

  _finish() {
    this.state = 'done';
    this.entities = [];
    this.boss = null;
    this.hud.boss = { active: false };
    this.hud.mission = { type: 'ABGESCHLOSSEN', title: 'Band 0 – Kapitel 1 geschafft!', text: 'Alle Einsätze erledigt', have: 1, need: 1 };
  }

  render(ctx, camera) {
    if (this.boss) this.boss.render(ctx, camera);
    for (const e of this.entities) e.render(ctx, camera);
  }
}
