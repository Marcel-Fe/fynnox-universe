// Test-Werkzeugkasten: statischer Server, Playwright-Auflösung, Prüf-Helfer
// und die Spiel-Griffe (Dialoge, Positionieren, Interagieren).
//
// Playwright ist bewusst KEINE Projekt-Abhängigkeit (Regel: kein Build-Step,
// keine Libraries im Spiel). Es wird dort gesucht, wo es ohnehin liegt:
// global installiert oder im npx-Cache.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';

// ---- Playwright finden --------------------------------------------------

export function requirePlaywright() {
  const req = createRequire(import.meta.url);
  try { return req('playwright'); } catch { /* nicht als Abhängigkeit installiert — weiter unten suchen */ }

  for (const dir of npxModuleDirs()) {
    try {
      const req2 = createRequire(pathToFileURL(dir + path.sep));
      return req2('playwright');
    } catch { /* dieser Cache-Eintrag hat kein Playwright */ }
  }
  throw new Error(
    'Playwright nicht gefunden.\n' +
    'Einmalig einrichten:  npx playwright@latest install chromium\n' +
    '(oder global: npm i -g playwright)'
  );
}

// Kandidaten-Ordner im npx-Cache (Windows und Unix).
function npxModuleDirs() {
  const roots = [
    path.join(os.homedir(), 'AppData', 'Local', 'npm-cache', '_npx'),
    path.join(os.homedir(), '.npm', '_npx'),
  ];
  const out = [];
  for (const root of roots) {
    let entries = [];
    try { entries = fs.readdirSync(root); } catch { continue; }
    for (const e of entries) {
      const dir = path.join(root, e, 'node_modules');
      if (fs.existsSync(path.join(dir, 'playwright', 'package.json'))) out.push(dir);
    }
  }
  return out;
}

// ---- Statischer Server (ersetzt "python -m http.server" im Test) --------

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
};

// Startet den Server. Läuft auf dem Port schon einer (z. B. ein manuell
// gestarteter), wird der genutzt statt abzubrechen.
export async function startServer(root, port = 8123) {
  const base = path.resolve(root);
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(base, rel === '/' ? 'index.html' : rel);
    if (!file.startsWith(base)) { res.writeHead(403).end('forbidden'); return; }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404).end('not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(buf);
    });
  });
  return new Promise((resolve, reject) => {
    server.once('error', async (err) => {
      if (err.code !== 'EADDRINUSE') { reject(err); return; }
      if (await responds(port)) { console.log(`  (Port ${port} ist bereits belegt — vorhandener Server wird genutzt)`); resolve({ close() {} }); }
      else reject(new Error(`Port ${port} ist belegt, antwortet aber nicht mit der Seite.`));
    });
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

function responds(port) {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port, path: '/index.html' }, (res) => {
      res.resume(); resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => { req.destroy(); resolve(false); });
  });
}

// ---- Prüf-Helfer --------------------------------------------------------

export function makeCheck() {
  const state = { passed: 0, failed: 0 };
  const check = (name, ok, extra = '') => {
    console.log(`  ${ok ? 'OK  ' : 'FAIL'}  ${name}${extra ? '  -> ' + extra : ''}`);
    ok ? state.passed++ : state.failed++;
    return ok;
  };
  return { check, state };
}

// Seite mit Fehler-Mitschnitt: jeder JS-Fehler lässt den Test scheitern.
export async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('dialog', (d) => d.accept());   // confirm() bei "Neues Spiel" bestätigen
  return { page, errors };
}

// ---- Spiel-Griffe (nutzen ausschließlich die Test-API window.__fynnox) --

export function game(page, baseURL) {
  const api = {
    async open() {
      await page.goto(baseURL);
      await page.waitForFunction(() => !!window.__fynnox);
    },
    async reload() {
      await page.reload();
      await page.waitForFunction(() => !!window.__fynnox);
    },
    async clearSave() { await page.evaluate(() => localStorage.clear()); },

    async newGame() {
      await page.click('[data-action="new"]');
      await page.waitForFunction(() => !!window.__fynnox.missions);
    },
    async continueGame() {
      await page.click('[data-action="continue"]');
      await page.waitForFunction(() => !!window.__fynnox.missions);
    },

    state: () => page.evaluate(() => {
      const f = window.__fynnox;
      return {
        index: f.missions.index, mstate: f.missions.state, dlg: f.dialogue.active,
        collected: f.collected, coins: f.hud.coins, crystals: f.hud.crystals,
        xp: f.hud.xp, level: f.hud.level, hearts: f.hud.hearts,
        isDay: f.level.dayNight.isDay, title: f.hud.mission.title, type: f.hud.mission.type,
        px: Math.round(f.player.x), py: Math.round(f.player.y),
      };
    }),
    savedIndex: () => page.evaluate(() => (window.__fynnox.save.load() || {}).missionIndex),

    // Laufenden Dialog komplett durchklicken (inkl. direkt folgendem Intro).
    async throughDialogue() {
      await page.evaluate(async () => {
        const d = window.__fynnox.dialogue;
        for (let i = 0; i < 60 && d.active; i++) {
          d.charTimer = 9999; d.advance();
          await new Promise((r) => requestAnimationFrame(r));
        }
      });
      await page.waitForTimeout(120);
    },

    // Fynnox an eine Stelle setzen (Steuerung wird hier nicht geprüft).
    put: (x, y) => page.evaluate(([px, py]) => {
      const p = window.__fynnox.player; p.x = px; p.y = py; p.vx = 0; p.vy = 0; p.invuln = 5;
    }, [x, y]),

    // Neben ein Missions-Objekt stellen und sofort Aktion drücken. Ohne Warten
    // dazwischen — Fynnox fällt sonst aus der Reichweite (90 px).
    async interact(entIndex, tries = 30) {
      for (let i = 0; i < tries; i++) {
        const done = await page.evaluate((n) => {
          const f = window.__fynnox, e = f.missions.entities[n];
          if (!e || e.done) return true;
          const p = f.player;
          p.x = e.x - 20; p.y = e.y; p.vx = 0; p.vy = 0; p.invuln = 5;
          return false;
        }, entIndex);
        if (done) return true;
        await page.keyboard.press('KeyE');
      }
      return page.evaluate((n) => {
        const e = window.__fynnox.missions.entities[n];
        return !e || e.done;
      }, entIndex);
    },

    waitFor: (fn, arg, timeout = 8000) => page.waitForFunction(fn, arg, { timeout, polling: 50 }),
    shot: (name) => page.screenshot({ path: path.join(outDir(), name + '.png') }),
  };
  return api;
}

// Ablage für Screenshots (liegt neben den Tests, ist in .gitignore).
export function outDir() {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '.out');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
