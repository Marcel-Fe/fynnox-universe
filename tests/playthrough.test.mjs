// Kompletter Durchlauf Band 0: alle fünf Einsätze bis zum Finale, mit
// Speicher-Checkpoint nach jedem Einsatz. Positionen werden gesetzt statt
// erlaufen — geprüft wird die Missions- und Speicher-Kette, nicht die Steuerung.
import { openPage, game } from './harness.mjs';

export const name = 'Durchlauf Band 0';

export default async function run({ browser, baseURL, check }) {
  const { page, errors } = await openPage(browser);
  const g = game(page, baseURL);

  await g.open();
  await g.clearSave();
  await g.reload();
  await g.newGame();
  await page.waitForFunction(() => window.__fynnox.dialogue.active);

  // --- Einsatz 0: drei Kristalle sammeln ---------------------------------
  await g.throughDialogue();
  check('E0 aktiv', (await g.state()).mstate === 'active');
  for (let i = 0; i < 3; i++) {
    const c = await page.evaluate((n) => {
      const c = window.__fynnox.level.collectibles[n]; return [c.x, c.y];
    }, i);
    await g.put(c[0], c[1]);
    await g.waitFor((n) => window.__fynnox.collected > n, i);
  }
  await g.waitFor(() => window.__fynnox.missions.state === 'outro');
  check('E0 abgeschlossen (3 Kristalle)', true, `collected=${(await g.state()).collected}`);
  await g.throughDialogue();
  let s = await g.state();
  check('E0 Belohnung verbucht', s.coins >= 130 && s.xp >= 200, `coins=${s.coins} xp=${s.xp}`);
  check('Checkpoint E0 gespeichert', (await g.savedIndex()) === 1, `missionIndex=${await g.savedIndex()}`);

  // --- Einsatz 1: Kätzchen retten ----------------------------------------
  check('E1 "Die Katze auf dem Dach"', (await g.state()).title.includes('Katze'));
  check('E1 Kätzchen erreicht', await g.interact(0));
  await g.waitFor(() => window.__fynnox.missions.state === 'outro');
  await g.throughDialogue();
  check('Checkpoint E1 gespeichert', (await g.savedIndex()) === 2, `missionIndex=${await g.savedIndex()}`);

  // --- Zwischendurch neu laden und fortsetzen -----------------------------
  await g.reload();
  await g.continueGame();
  await g.waitFor(() => window.__fynnox.missions.index === 2);
  s = await g.state();
  check('Fortsetzen mitten im Spiel', s.index === 2 && s.coins >= 280, `index=${s.index} coins=${s.coins}`);

  // --- Einsatz 2: drei Brände löschen -------------------------------------
  await g.throughDialogue();
  check('E2 "Feuer in der Altstadt"', (await g.state()).title.includes('Feuer'));
  await page.keyboard.down('KeyE');            // Löschschaum wird gehalten
  for (let i = 0; i < 3; i++) {
    await g.waitFor((n) => {
      const f = window.__fynnox, e = f.missions.entities[n];
      if (!e || e.done) return true;
      const p = f.player;                      // dicht am Feuer halten
      p.x = e.x - 20; p.vx = 0; p.invuln = 5;
      if (p.y > e.y + 40) { p.y = e.y - 20; p.vy = 0; }
      return false;
    }, i, 15000);
  }
  await page.keyboard.up('KeyE');
  await g.waitFor(() => window.__fynnox.missions.state === 'outro');
  check('E2 abgeschlossen (3 Brände)', true);
  await g.throughDialogue();
  check('Checkpoint E2 gespeichert', (await g.savedIndex()) === 3, `missionIndex=${await g.savedIndex()}`);

  // --- Einsatz 3: den Dieb schnappen --------------------------------------
  check('E3 "Der Schatten-Dieb"', (await g.state()).title.includes('Dieb'));
  await g.waitFor(() => {
    const f = window.__fynnox, e = f.missions.entities[0];
    if (!e || e.done) return true;
    const p = f.player;                        // dem Fliehenden hinterher
    p.x = e.x; p.y = e.y; p.vx = 0; p.vy = 0; p.invuln = 5;
    return false;
  }, null, 10000);
  await g.waitFor(() => window.__fynnox.missions.state === 'outro');
  check('E3 abgeschlossen (Dieb geschnappt)', true);
  await g.throughDialogue();
  check('Checkpoint E3 gespeichert', (await g.savedIndex()) === 4, `missionIndex=${await g.savedIndex()}`);

  // --- Einsatz 4: Boss Dr. Vorax ------------------------------------------
  check('E4 "Showdown: Dr. Vorax"', (await g.state()).title.includes('Vorax'));
  check('Boss-Leiste im HUD aktiv', await page.evaluate(() => window.__fynnox.hud.boss.active === true));
  await g.shot('run-boss');
  // Schild-Phasen abwarten, im verwundbaren Fenster zuschlagen (3 Treffer).
  for (let round = 0; round < 250; round++) {
    const state = await page.evaluate(() => {
      const f = window.__fynnox, b = f.missions.boss;
      if (!b || b.defeated) return 'done';
      const p = f.player;
      p.x = b.x - 40; p.y = b.y + 20; p.vx = 0; p.vy = 0; p.invuln = 5;
      return b.state;
    });
    if (state === 'done') break;
    if (state === 'vulnerable') await page.keyboard.press('KeyE');
    else await page.waitForTimeout(180);
  }
  check('Boss besiegt', await page.evaluate(() => window.__fynnox.missions.boss?.defeated === true),
    `hp=${await page.evaluate(() => window.__fynnox.missions.boss?.hp)}`);
  await g.waitFor(() => window.__fynnox.missions.state === 'outro');
  await g.throughDialogue();

  s = await g.state();
  check('Band 0 abgeschlossen', s.mstate === 'done' && s.type === 'ABGESCHLOSSEN', JSON.stringify(s));
  check('Endstand gespeichert (missionIndex=5)', (await g.savedIndex()) === 5);
  await g.shot('run-finale');

  // --- Endstand fortsetzen darf nicht abstürzen ---------------------------
  await g.reload();
  await g.continueGame();
  await g.waitFor(() => window.__fynnox.missions.state === 'done');
  s = await g.state();
  check('Fortsetzen nach dem Finale bleibt "abgeschlossen"', s.mstate === 'done' && s.index === 5);
  check('Fortschritt komplett erhalten', s.coins >= 1900 && s.level >= 2,
    `coins=${s.coins} level=${s.level} xp=${s.xp}`);

  await page.close();
  return errors;
}
