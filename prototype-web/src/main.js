// Bootstrap: verbindet Engine, Welt, Held, Systeme und startet die Game-Loop.
import { GameLoop } from './engine/loop.js';
import { Input } from './engine/input.js';
import { Camera } from './engine/camera.js';
import { SceneManager } from './engine/scene.js';
import { Level } from './world/level.js';
import { Player } from './entities/player.js';
import { HUD } from './systems/hud.js';
import { Dialogue, bindDialogueClick } from './systems/dialogue.js';
import { MissionManager } from './systems/missions.js';
import { rectsOverlap } from './systems/physics.js';
import { setupMenu } from './ui/menu.js';
import * as SaveStore from './systems/save.js';
import { CHARACTERS } from '../data/characters.js';
import { BAND0_ALTSTADT_NACHT } from '../data/levels/band0-altstadt-nacht.js';
import { BAND0_MISSIONS } from '../data/missions/band0.js';

// Feste Spielhöhe, flexible Breite: auf breiten Bildschirmen sieht man mehr von
// der Welt statt schwarzer Balken. Gezeichnet wird immer in diesen logischen
// Einheiten — `zoom` rechnet sie auf die echten Bildschirmpixel hoch (scharf).
const VIEW_H = 540, VIEW_W_MIN = 800, VIEW_W_MAX = 1400;
const view = { w: 960, h: VIEW_H, zoom: 1 };

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scene = new SceneManager('menu');
const input = new Input();
const camera = new Camera(view.w, view.h);

function resize() {
  const cssW = canvas.clientWidth || window.innerWidth;
  const cssH = canvas.clientHeight || window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  view.w = Math.round(Math.max(VIEW_W_MIN, Math.min(VIEW_W_MAX, VIEW_H * (cssW / cssH))));
  view.zoom = (cssH * dpr) / VIEW_H;
  canvas.width = Math.round(view.w * view.zoom);
  canvas.height = Math.round(view.h * view.zoom);
  camera.resize(view.w, view.h);
}
resize();
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);

let level, player, hud, hudState, dialogue, missions, collected = 0, started = false;
let autoSaveCooldown = 0; // Sekunden bis zum nächsten Kristall-Speichern (Drosselung)

function startGame(options = {}) {
  if (started) return;
  started = true;

  level = new Level(BAND0_ALTSTADT_NACHT);
  camera.setBounds(level.data.size.w, level.data.size.h);
  camera.configure(level.data.camera);      // optionale Kamera-Werte aus den Leveldaten
  player = new Player(CHARACTERS.fynnox, level.data.spawn);
  camera.snapTo(player.x + player.w / 2, player.y + player.h / 2);
  collected = 0;

  hudState = {
    name: CHARACTERS.fynnox.name, avatar: CHARACTERS.fynnox.portrait,
    level: 1, xp: 0, xpMax: 1000,
    maxHearts: 5, hearts: 5,
    crystals: 0, coins: 0, isDay: false,
    mission: { type: 'HAUPTMISSION', title: '…', text: '', have: 0, need: 1 },
    gadgets: ['Scanner', 'Greifhaken', 'Rauchkapsel', 'Multitool', 'Drohne'],
    activeGadget: 0,
    map: { px: 0, py: 0, pins: [] },
    boss: { active: false },
    savedFlash: 0,            // > 0 -> HUD zeigt kurz "Gespeichert"
  };
  hud = new HUD(hudState);

  dialogue = new Dialogue();
  bindDialogueClick(canvas, dialogue);
  missions = new MissionManager(BAND0_MISSIONS, {
    dialogue, hud: hudState, getCollected: () => collected,
    onMissionDone: () => saveNow(),          // Checkpoint nach jedem Einsatz
  });

  const loaded = options.continueSave ? SaveStore.load() : null;
  if (loaded && applySave(loaded)) return;   // fortgesetzt — kein Story-Neustart
  missions.start();                          // startet mit dem ersten Story-Dialog
}

// ---- Spielstand: einsammeln & anwenden ----------------------------------
// Der Stand kennt nur IDs/Indizes aus data/ — kein levelspezifisches Wissen im Code.

function collectSave() {
  return {
    levelId: level.data.id,
    missionIndex: missions.index,
    collected,
    collectibles: level.collectibles.map((c) => c.collected),
    isDay: level.dayNight.isDay,
    player: { x: player.x, y: player.y },
    hud: {
      level: hudState.level, xp: hudState.xp, xpMax: hudState.xpMax,
      hearts: hudState.hearts, maxHearts: hudState.maxHearts,
      coins: hudState.coins, crystals: hudState.crystals,
    },
  };
}

// Schreibt einen geladenen Stand zurück. Fehlende oder unbrauchbare Felder
// behalten ihren Standardwert, damit ein alter Stand nichts kaputt macht.
// Gibt false zurück, wenn der Stand nicht zu diesem Level gehört.
function applySave(data) {
  if (data.levelId !== level.data.id) return false;

  const h = data.hud || {};
  hudState.level = num(h.level, hudState.level, 1);
  hudState.xpMax = num(h.xpMax, hudState.xpMax, 1);
  hudState.xp = clamp(num(h.xp, hudState.xp, 0), 0, hudState.xpMax);
  hudState.maxHearts = clamp(num(h.maxHearts, hudState.maxHearts, 1), 1, 20);
  hudState.hearts = clamp(num(h.hearts, hudState.hearts, 0), 0, hudState.maxHearts);
  hudState.coins = num(h.coins, hudState.coins, 0);
  hudState.crystals = num(h.crystals, hudState.crystals, 0);

  // Sammelobjekte nur übernehmen, wenn die Liste zum Level passt.
  const flags = data.collectibles;
  if (Array.isArray(flags) && flags.length === level.collectibles.length) {
    level.collectibles.forEach((c, i) => { c.collected = !!flags[i]; });
  }
  collected = clamp(num(data.collected, 0, 0), 0, level.collectibles.length);

  if (!!data.isDay !== level.dayNight.isDay) level.dayNight.toggle();
  level.dayNight.t = level.dayNight.target;   // ohne Überblendung starten
  hudState.isDay = level.dayNight.isDay;

  const p = data.player || {};
  player.x = clamp(num(p.x, player.x, 0), 0, level.data.size.w - player.w);
  player.y = clamp(num(p.y, player.y, 0), 0, level.data.size.h);
  player.vx = 0; player.vy = 0;
  camera.snapTo(player.x + player.w / 2, player.y + player.h / 2);

  // Der laufende Einsatz beginnt neu (inklusive Intro-Dialog) — sein
  // Zwischenstand ist nicht rekonstruierbar, der Fortschritt davor schon.
  missions.skipTo(num(data.missionIndex, 0, 0));
  return true;
}

// Zahl aus dem Stand übernehmen; unbrauchbar -> Standardwert.
function num(v, fallback, min) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return fallback;
  return min === undefined ? v : Math.max(min, v);
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function saveNow() {
  if (!started) return false;
  const ok = SaveStore.save(collectSave());
  if (ok) hudState.savedFlash = 2;   // Sekunden
  return ok;
}

function update(dt) {
  if (!scene.is('play') || !started) return;

  // "Gespeichert"-Hinweis läuft auch während eines Dialogs aus.
  if (hudState.savedFlash > 0) hudState.savedFlash = Math.max(0, hudState.savedFlash - dt);

  // Story-Dialog friert das Gameplay ein.
  if (dialogue.active) { dialogue.update(input, dt); input.endFrame(); return; }

  // Tag/Nacht umschalten (Taste N oder Button)
  if (input.pressed.toggleDayNight) {
    level.dayNight.toggle();
    hudState.isDay = level.dayNight.isDay;
  }

  player.update(input, level, dt);
  level.update(dt);
  camera.follow(player.x + player.w / 2, player.y + player.h / 2, dt, {
    lead: player.vx / player.char.moveSpeed,   // Vorausschau in Laufrichtung
    grounded: player.onGround,
  });
  // harte Landung gibt dem Bild einen kurzen Stoß
  if (player.landImpact > 0.55) camera.impulse(1.5 + player.landImpact * 3);

  // Kristalle einsammeln
  let gotCrystal = false;
  for (const c of level.collectibles) {
    if (!c.collected && rectsOverlap(player.rect, { x: c.x, y: c.y, w: c.w, h: c.h })) {
      c.collected = true;
      collected += 1;
      hudState.crystals += 25;
      hudState.coins += 10;
      gotCrystal = true;
    }
  }
  // Gedrosselt speichern: höchstens alle 5 s, nicht bei jedem Kristall.
  autoSaveCooldown = Math.max(0, autoSaveCooldown - dt);
  if (gotCrystal && autoSaveCooldown === 0) { saveNow(); autoSaveCooldown = 5; }

  // Missionen (Ziele, interaktive Objekte, Story-Trigger, Belohnungen)
  missions.update(player, input, dt);

  // Minimap aktualisieren
  const size = level.data.size;
  hudState.map.px = player.x / size.w;
  hudState.map.pins = level.collectibles.map((c) => ({ x: c.x / size.w, y: c.y / size.h, collected: c.collected }));

  input.endFrame();
}

function render() {
  // Alles wird in logischen Einheiten gezeichnet; der Zoom bringt es in echter
  // Bildschirmauflösung auf die Fläche -> scharf statt hochskaliert.
  ctx.setTransform(view.zoom, 0, 0, view.zoom, 0, 0);
  ctx.clearRect(0, 0, view.w, view.h);

  if (scene.is('play') && started) {
    level.renderBackground(ctx, camera);
    level.renderCollectibles(ctx, camera);
    missions.render(ctx, camera);
    player.render(ctx, camera);
    hud.render(ctx, view.w, view.h);
    dialogue.render(ctx, view.w, view.h);
  }
}

// Steuerung anschließen (Tastatur + Touch-Buttons aus index.html)
input.attach({
  'btn-left': 'left',
  'btn-right': 'right',
  'btn-jump': 'jump',
  'btn-action': 'action',
  'btn-daynight': 'toggleDayNight',
});

setupMenu(scene, {
  hasSave: SaveStore.hasSave(),
  onContinue: () => startGame({ continueSave: true }),
  onNew: () => { SaveStore.clear(); startGame(); },
});

// Beim Verlassen/Wegschalten der Seite sichern (letzte Chance).
window.addEventListener('pagehide', () => saveNow());
document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(); });

const loop = new GameLoop(update, render);
loop.start();

// Für automatische Tests aus der Konsole erreichbar.
window.__fynnox = {
  scene, input, camera, get player() { return player; }, get level() { return level; },
  get hud() { return hudState; }, get dialogue() { return dialogue; },
  get missions() { return missions; }, get collected() { return collected; }, startGame,
  save: { now: saveNow, collect: () => collectSave(), ...SaveStore },
};
