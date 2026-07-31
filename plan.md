# plan.md — Master-Roadmap „Fynnox Universe – Band 0"

> Schritt-für-Schritt-Fahrplan gemäß Masterprompt. Status: ✅ fertig · 🔄 in Arbeit · ⬜ offen.
> Reihenfolge bewusst eingehalten — nichts auf einmal, jedes Thema als eigenes Dokument in `docs/`.

## Aktueller Fokus
**Web-Prototyp zuerst** (bestätigt). Ziel-Engine langfristig Unity/URP; der Web-Prototyp beweist
Mechanik & modulare Architektur und ist als Web-App über GitHub Pages spielbar.

## Fundament
- ✅ Ordnerstruktur angelegt, Konzept-PNGs nach `design/` verschoben
- ✅ `kontext.md` — Projekt-Bibel (Kanon aus den Design-Bildern)
- ✅ `CLAUDE.md` — Projekt-Arbeitsregeln
- ✅ `plan.md` — diese Roadmap
- 🔄 `docs/02-architektur.md` — modulare System-Architektur

## Masterprompt-Reihenfolge (Entwicklungsdokumente)
| # | Thema | Status | Datei |
|---|---|---|---|
| 00 | Projektstruktur | 🔄 | (in `docs/README.md` + dieser Datei skizziert) |
| 01 | Ordnerstruktur | ✅ | angelegt; Doku folgt in `docs/01-ordnerstruktur.md` |
| 02 | Architektur | ✅ | `docs/02-architektur.md` |
| 03 | Spielsysteme | ✅ | `docs/03-spielsysteme.md` |
| 04 | Welt (allgemein) | ⬜ | |
| 05 | Raven City | ⬜ | |
| 06 | FOX DEN | ⬜ | |
| 07 | Charaktere | ⬜ | (Kanon steht in `kontext.md`, Detaildoku folgt) |
| 08 | Gegner / Schattenorden | ⬜ | |
| 09 | Fahrzeuge | ⬜ | |
| 10 | Gadgets | ⬜ | |
| 11 | UI | 🔄 | Startmenü + HUD nach Mockup-Layout umgesetzt; weitere Screens offen |
| 12 | HUD | ✅ | Avatar+Level, XP, Münzen/Kristalle, Minimap, Missions-Panel, Gadget-Leiste (nach `design/ui-mockups/`) |
| 13 | Animationen | 🔄 | Fynnox als Puppet animiert (Beine/Schwanz/Körper aus dem echten Artwork); alle Figuren als echte Sprites |
| 14 | Missionen | 🔄 | Missions-Manager + Story-Dialoge; Einsätze „erste Nacht", „Feuer", „Dieb" |
| 15 | Nebenmissionen | 🔄 | „Katze auf dem Dach" umgesetzt |
| 16 | Bosskämpfe | ✅ | Boss-Finale Dr. Vorax (Energiebälle, Schild-Phasen, Herzen/Schaden) |
| 17 | Speicherstände | ✅ | `src/systems/save.js` (localStorage, versioniert `fynnox:save:v1`); Auto-Speichern nach Einsatz, beim Kristall (5 s gedrosselt) und beim Seitenwechsel; Menü „Weiter Spielen" vs. „Neues Spiel" |
| 18 | Audio | ⬜ | |
| 19 | Optimierung | ⬜ | |
| 20 | Tests | ✅ | `tests/` — `node tests/run.mjs`: Speicherstände + kompletter Durchlauf Band 0 im echten Browser (39 Checks, eigener Server, kein Framework) |
| 21 | Release | 🔄 | Live als Web-App: https://marcel-fe.github.io/fynnox-universe/ (Pages aus `main`, Root leitet auf `prototype-web/`) |
| 22+ | Erweiterungen (Band 1, 2, 3 …) | ⬜ | neue `data/levels/`-Dateien, kein Engine-Umbau |

## Web-Prototyp (Vertical Slice)
- ✅ Engine: Game-Loop, Input (Tastatur+Touch), Kamera, Physik, Szenen
- ✅ Player: Fynnox-Zustandsautomat (idle/run/jump/doublejump/fall) + Glow
- ✅ Welt: Level „Altstadt – Nacht", Parallax mit Tiefe/Dunst, Sterne, Mond, Vignette, Tag/Nacht
- ✅ HUD: Avatar+Level, XP, Münzen/Kristalle, Minimap, Missions-Panel, Gadget-Leiste
- ✅ Einsätze + Story: Dialog-System (Comic-Sprechblasen), 4 Einsätze, Belohnungen, Cliffhanger
- ✅ Echte Grafik: **3D-gerenderter Fynnox** (aus `fynnox.glb`, Seitenansicht freigestellt),
      Raven-City-Hintergrund (Tiefenunschärfe/abgedunkelt), Dr.-Vorax-Boss + Dialog-Portraits
- ✅ „Glänzend modern": schwebende Licht-Partikel, Nebel, Glow um Figuren, Tiefen-Fokus
- ✅ Spielgefühl (Mario-Vorbild): Beschleunigung + Auslaufen, steuerbare Sprunghöhe (65/127 px),
      Coyote-Time 100 ms, Sprungpuffer 120 ms; Werte als Daten in `characters.js` → `motion`
- ✅ Kamera: Totzone, Vorausschau bis 105 px, vertikal träge (Sprung bewegt das Bild nicht),
      kurzer Stoß bei harter Landung; pro Level über `level.data.camera` einstellbar
- ✅ Wucht: Staub bei Absprung/Landung/Lauf, Luftstoß beim Doppelsprung, Aufprall-Stauchung
- ✅ Bild: Canvas rendert in echter Bildschirmauflösung (feste Spielhöhe, Breite folgt dem Fenster),
      keine schwarzen Balken; Hintergrund nahtlos gespiegelt gekachelt und mitlaufend (Faktor 0,35)
- ✅ Schwebeplattformen sind durchlässig (`oneWay`): von unten durchspringen, nur von oben landen —
      vorher stieß man sich den Kopf an und blieb an den Seitenkanten hängen
- ✅ Fynnox-Lauf-/Sprung-Animation: Artwork in Körper/Schwanz/Bein zerlegt und als Puppet animiert
      (Werte datengetrieben in `data/characters.js` → `puppet`)
- ✅ Katze als echtes Artwork (aus dem Comic-Panel freigestellt); Missions-Objekte haben jetzt einen
      Bild-Slot (`sprite` in den Missionsdaten) mit gezeichnetem Fallback
- ✅ Dieb (Waschbär) als echtes Sprite + eigenes Dialog-Portrait (neues Artwork vom 31.07.2026);
      `spriteAnchor` in den Missionsdaten setzt den Körper korrekt über die Trefferbox
- ℹ️ Verworfen: Frames aus `fynnox.glb` rendern — das 3D-Modell hat **keinen Schwanz**, das Ergebnis
      wäre schlechter als das vorhandene Artwork (geprüft mit Test-Renderings)
- ✅ GitHub-Repo + GitHub Pages Deploy

## Bewusst NICHT im aktuellen Schritt
Fertige Story, echte Sprites/Audio, Fahrzeug-Gameplay, FOX-DEN-Interior, Speichersystem,
Unity-Portierung. Jeweils eigener späterer Schritt + eigenes Dokument.
