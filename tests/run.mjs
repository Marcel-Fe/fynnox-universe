// Startet den statischen Server, führt alle Testsuiten aus und meldet das
// Gesamtergebnis. Aufruf aus dem Wurzelverzeichnis:  node tests/run.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requirePlaywright, startServer, makeCheck } from './harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..', 'prototype-web');
const PORT = 8123;
const BASE = `http://127.0.0.1:${PORT}/index.html`;

const FILES = ['save.test.mjs', 'playthrough.test.mjs'];
// Einzelne Suite: node tests/run.mjs save   (trifft Dateiname oder Suite-Name)
const filter = (process.argv[2] || '').toLowerCase();

const suites = [];
for (const file of FILES) {
  const mod = await import('./' + file);
  if (!filter || file.toLowerCase().includes(filter) || mod.name.toLowerCase().includes(filter)) {
    suites.push({ file, mod });
  }
}
if (suites.length === 0) {
  console.log(`Keine Suite passt zu "${process.argv[2]}". Verfügbar: ${FILES.join(', ')}`);
  process.exit(1);
}

const { chromium } = requirePlaywright();
const server = await startServer(ROOT, PORT);
// Ohne SwiftShader-Flags starten — sonst blockieren die Screenshots.
const browser = await chromium.launch();
const { check, state } = makeCheck();
const allErrors = [];

try {
  for (const { mod } of suites) {
    console.log(`\n▸ ${mod.name}`);
    const errors = await mod.default({ browser, baseURL: BASE, check });
    if (errors?.length) allErrors.push(...errors.map((e) => `[${mod.name}] ${e}`));
  }
} catch (e) {
  console.log(`\n  ABBRUCH: ${e.message}`);
  state.failed++;
} finally {
  await browser.close();
  server.close();
}

console.log(`\nChecks: ${state.passed} ok, ${state.failed} fehlgeschlagen · JS-Fehler: ${allErrors.length}`);
allErrors.forEach((e) => console.log('  ' + e));
// Null gelaufene Checks ist kein Erfolg, sondern ein kaputter Lauf.
const green = state.failed === 0 && allErrors.length === 0 && state.passed > 0;
console.log(green ? 'ALLES GRUEN' : 'FEHLGESCHLAGEN');
process.exit(green ? 0 : 1);
