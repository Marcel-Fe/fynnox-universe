// Bootstrap: verbindet Engine, Welt, Held, Systeme und startet die Game-Loop.
import { GameLoop } from './engine/loop.js';
import { Input } from './engine/input.js';
import { Camera } from './engine/camera.js';
import { SceneManager } from './engine/scene.js';
import { Level } from './world/level.js';
import { Player } from './entities/player.js';
import { HUD } from './systems/hud.js';
import { rectsOverlap } from './systems/physics.js';
import { setupMenu } from './ui/menu.js';
import { CHARACTERS } from '../data/characters.js';
import { BAND0_ALTSTADT_NACHT } from '../data/levels/band0-altstadt-nacht.js';

const VIEW_W = 960, VIEW_H = 540;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Logische Auflösung fix; CSS skaliert das Canvas auf die Fenstergröße.
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const scene = new SceneManager('menu');
const input = new Input();
const camera = new Camera(VIEW_W, VIEW_H);

let level, player, hud, hudState, started = false;

function startGame() {
  if (started) return;
  started = true;

  level = new Level(BAND0_ALTSTADT_NACHT);
  camera.setBounds(level.data.size.w, level.data.size.h);
  player = new Player(CHARACTERS.fynnox, level.data.spawn);

  hudState = { maxHearts: 3, hearts: 3, crystals: 0, coins: 0, isDay: false };
  hud = new HUD(hudState);
}

function update(dt) {
  if (!scene.is('play') || !started) return;

  // Tag/Nacht umschalten (Taste N oder Button)
  if (input.pressed.toggleDayNight) {
    level.dayNight.toggle();
    hudState.isDay = level.dayNight.isDay;
  }

  player.update(input, level, dt);
  level.update(dt);
  camera.follow(player.x + player.w / 2, player.y + player.h / 2, dt);

  // Kristalle einsammeln
  for (const c of level.collectibles) {
    if (!c.collected && rectsOverlap(player.rect, { x: c.x, y: c.y, w: c.w, h: c.h })) {
      c.collected = true;
      hudState.crystals += 25;
      hudState.coins += 10;
    }
  }

  input.endFrame();
}

function render() {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);

  if (scene.is('play') && started) {
    level.renderBackground(ctx, camera);
    level.renderCollectibles(ctx, camera);
    player.render(ctx, camera);
    hud.render(ctx);
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
  scene, input, get player() { return player; }, get level() { return level; },
  get hud() { return hudState; }, startGame,
};
