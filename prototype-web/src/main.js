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
import { CHARACTERS } from '../data/characters.js';
import { BAND0_ALTSTADT_NACHT } from '../data/levels/band0-altstadt-nacht.js';
import { BAND0_MISSIONS } from '../data/missions/band0.js';

const VIEW_W = 960, VIEW_H = 540;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Logische Auflösung fix; CSS skaliert das Canvas auf die Fenstergröße.
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const scene = new SceneManager('menu');
const input = new Input();
const camera = new Camera(VIEW_W, VIEW_H);

let level, player, hud, hudState, dialogue, missions, collected = 0, started = false;

function startGame() {
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
  };
  hud = new HUD(hudState);

  dialogue = new Dialogue();
  bindDialogueClick(canvas, dialogue);
  missions = new MissionManager(BAND0_MISSIONS, { dialogue, hud: hudState, getCollected: () => collected });
  missions.start(); // startet mit dem ersten Story-Dialog
}

function update(dt) {
  if (!scene.is('play') || !started) return;

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
  for (const c of level.collectibles) {
    if (!c.collected && rectsOverlap(player.rect, { x: c.x, y: c.y, w: c.w, h: c.h })) {
      c.collected = true;
      collected += 1;
      hudState.crystals += 25;
      hudState.coins += 10;
    }
  }

  // Missionen (Ziele, interaktive Objekte, Story-Trigger, Belohnungen)
  missions.update(player, input, dt);

  // Minimap aktualisieren
  const size = level.data.size;
  hudState.map.px = player.x / size.w;
  hudState.map.pins = level.collectibles.map((c) => ({ x: c.x / size.w, y: c.y / size.h, collected: c.collected }));

  input.endFrame();
}

function render() {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);

  if (scene.is('play') && started) {
    level.renderBackground(ctx, camera);
    level.renderCollectibles(ctx, camera);
    missions.render(ctx, camera);
    player.render(ctx, camera);
    hud.render(ctx);
    dialogue.render(ctx);
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

setupMenu(scene, startGame);

const loop = new GameLoop(update, render);
loop.start();

// Für automatische Tests aus der Konsole erreichbar.
window.__fynnox = {
  scene, input, camera, get player() { return player; }, get level() { return level; },
  get hud() { return hudState; }, get dialogue() { return dialogue; },
  get missions() { return missions; }, get collected() { return collected; }, startGame,
};
