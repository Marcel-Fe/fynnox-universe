# CLAUDE.md — Arbeitsregeln für das Projekt „Fynnox Universe"

> Diese Datei steuert, wie Claude Code **in diesem Repo** arbeitet. Sie ergänzt die globalen
> Regeln (Deutsch antworten, knapp, Root-Cause statt Symptom, Plan bei Neuerstellungen).

## Single Source of Truth
- **`kontext.md` ist der verbindliche Kanon.** Vor jeder inhaltlichen Arbeit (Figur, Ort, Mission,
  Fahrzeug, UI) dort nachsehen. Nichts erfinden, was dem Kanon widerspricht.
- Neue Kanon-Fakten **zuerst in `kontext.md`** eintragen, dann in Code/Assets umsetzen.
- Bei Widerspruch in den Design-Bildern: die in `kontext.md` mit ⚠️ markierte Entscheidung gilt.

## Stil-Kanon (nicht verhandelbar)
- Nur das Fynnox-Universum: bestehende Charaktere, Raven City, FOX DEN, Fahrzeuge, Gadgets, Comicstil.
- **Keine** neuen Stilrichtungen. Kein Horror, kein Realismus, kein Anime. Warm, freundlich, 6+.
- Farbwelt einhalten: Dunkelblau (Basis), Gold (UI), Orange (Held), Lila (Böse), Türkis (Kristall/Tech).

## Modularität = oberstes Architektur-Gesetz
- **Inhalt sind Daten, nicht Code.** Charaktere, Level, Gegner, Fahrzeuge, ganze Comic-Bände liegen
  als Daten-Dateien in `prototype-web/data/` (später engine-spezifisch, z. B. Unity ScriptableObjects).
- Erweitern ohne Umbau: neuer Band = neue Datei in `data/levels/`; neuer Charakter = neuer Eintrag in
  `data/characters.js`. **Engine-Code (`src/engine`, `src/systems`) bleibt dabei unangetastet.**
- Wenn eine Änderung den Engine-Code anfassen muss, um bloß Inhalt hinzuzufügen: das ist ein
  Architektur-Fehler — melden und sauber lösen, nicht umgehen.

## Ordner-Konventionen
- `design/` — Original-Konzept-PNGs (Referenz, nicht verändern).
- `kontext.md`, `CLAUDE.md`, `plan.md` — Fundament im Wurzelverzeichnis.
- `docs/` — nummerierte professionelle Entwicklungsdokumente (siehe `docs/README.md`).
- `prototype-web/` — spielbarer Web-Prototyp: `src/` = Engine/Logik, `data/` = Inhalt, `assets/` = Grafik/Ton.
- `tests/` — automatischer Browser-Durchlauf (`node tests/run.mjs`), siehe `tests/README.md`.

## Namens- & Sprachregeln
- **Doku auf Deutsch**, **Code (Variablen/Funktionen/Dateien) auf Englisch**.
- Dateinamen: kebab-case (`band0-altstadt-nacht.js`). Klassen: PascalCase. Funktionen/Variablen: camelCase.
- Kommentare nur wenn das *Warum* nicht offensichtlich ist.

## Arbeitsweise
- Bei Neuerstellung/Erstplanung: Plan zeigen, dann umsetzen. Bei Bug-Fixes/kleinen Änderungen: direkt.
- Bestehenden Code **immer lesen**, bevor er geändert wird; nach bestehender Implementierung suchen,
  bevor Neues entsteht.
- Nach kritischen Änderungen am Prototyp: **im Browser testen** (`node tests/run.mjs`, muss grün bleiben)
  und mit Screenshot belegen.
- `plan.md` nach jedem abgeschlossenen Schritt aktualisieren (Status ✅/🔄/⬜).
- Keine Dateien löschen ohne Bestätigung. Kein `git push --force` ohne Nachfrage.

## Prototyp-Technik (aktueller Stand)
- Vanilla JS + HTML5-Canvas, ES-Module, **kein Build-Step, keine externen Libraries**.
- Läuft direkt über einen statischen Webserver (z. B. `python -m http.server` in `prototype-web/`).
- Deploy als Web-App über **GitHub Pages** (Branch-Deploy des `prototype-web/`-Inhalts bzw. Root).
