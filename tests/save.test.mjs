// Speicherstände (plan.md Kapitel 17): Menü-Logik, Sichern, Wiederherstellen,
// Robustheit gegen kaputte Stände.
import { openPage, game } from './harness.mjs';

export const name = 'Speicherstände';

export default async function run({ browser, baseURL, check }) {
  const { page, errors } = await openPage(browser);
  const g = game(page, baseURL);

  // --- Frischer Start: kein Spielstand -----------------------------------
  await g.open();
  await g.clearSave();
  await g.reload();
  check('Weiter Spielen ohne Stand deaktiviert', await page.isDisabled('[data-action="continue"]'));
  check('Neues Spiel ist hervorgehoben',
    (await page.getAttribute('[data-action="new"]', 'class')).includes('primary'));

  await g.newGame();
  await page.waitForFunction(() => window.__fynnox.dialogue.active);
  await g.throughDialogue();
  check('Erster Einsatz läuft', (await g.state()).mstate === 'active');

  // --- Fortschritt herstellen, beim Seitenwechsel sichern -----------------
  await page.evaluate(() => {
    const f = window.__fynnox;
    f.missions.skipTo(2);
    f.hud.coins = 777; f.hud.crystals = 321; f.hud.xp = 555; f.hud.hearts = 3;
    f.level.collectibles[0].collected = true;
    f.level.collectibles[1].collected = true;
    f.level.dayNight.toggle();          // -> Tag
    f.player.x = 1500; f.player.y = 300;
  });
  await page.waitForTimeout(150);
  await g.reload();                     // pagehide -> automatisches Speichern

  const saved = await page.evaluate(() => window.__fynnox.save.load());
  check('Stand liegt in localStorage', !!saved, saved ? `version=${saved.version} missionIndex=${saved.missionIndex}` : '');
  check('Stand ist versioniert', saved?.version === 1);
  check('Weiter Spielen ist jetzt aktiv', !(await page.isDisabled('[data-action="continue"]')));

  // --- Weiter Spielen stellt alles wieder her ----------------------------
  await g.continueGame();
  await page.waitForTimeout(150);
  const s = await g.state();
  const flags = await page.evaluate(() => window.__fynnox.level.collectibles.map((c) => c.collected).slice(0, 3));
  check('Missionsindex wiederhergestellt', s.index === 2, `index=${s.index}`);
  check('Münzen/Kristalle/XP/Herzen erhalten',
    s.coins === 777 && s.crystals === 321 && s.xp === 555 && s.hearts === 3, JSON.stringify(s));
  check('Tag/Nacht erhalten', s.isDay === true);
  check('Position erhalten', s.px === 1500 && s.py === 300, `x=${s.px} y=${s.py}`);
  check('Eingesammelte Kristalle erhalten', JSON.stringify(flags) === '[true,true,false]', JSON.stringify(flags));
  await g.shot('save-continue');

  // --- Im Menü wird nicht gespeichert, kaputter Stand blockiert nicht -----
  await g.reload();                     // zurück ins Menü (kein laufendes Spiel)
  await page.evaluate(() => localStorage.setItem('fynnox:save:v1', '{kaputt'));
  await g.reload();
  check('Im Menü wird nicht gespeichert',
    await page.evaluate(() => localStorage.getItem('fynnox:save:v1') === '{kaputt'));
  check('Kaputter Stand -> load() gibt null', await page.evaluate(() => window.__fynnox.save.load() === null));
  check('Kaputter Stand -> Weiter deaktiviert', await page.isDisabled('[data-action="continue"]'));
  await g.newGame();
  check('Spiel startet trotz kaputtem Stand', (await g.state()).index === 0);

  // --- Speichern beim Kristall (gedrosselt) + HUD-Rückmeldung ------------
  await g.throughDialogue();
  await page.evaluate(() => {
    const f = window.__fynnox;
    f.save.clear();
    const c = f.level.collectibles[0];
    f.player.x = c.x; f.player.y = c.y;      // direkt in den ersten Kristall stellen
  });
  await page.waitForTimeout(500);
  check('Kristall löst Speichern aus', await page.evaluate(() => window.__fynnox.save.hasSave()));
  check('HUD zeigt "Gespeichert"', await page.evaluate(() => window.__fynnox.hud.savedFlash > 0));
  await g.shot('save-flash');

  // --- Neues Spiel löscht den Stand --------------------------------------
  await g.reload();
  await g.newGame();                    // confirm() wird automatisch bestätigt
  await page.waitForTimeout(150);
  check('Neues Spiel löscht den Stand', await page.evaluate(() => window.__fynnox.save.hasSave() === false));

  await page.close();
  return errors;
}
