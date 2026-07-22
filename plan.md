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
| 02 | Architektur | 🔄 | `docs/02-architektur.md` |
| 03 | Spielsysteme | ⬜ | |
| 04 | Welt (allgemein) | ⬜ | |
| 05 | Raven City | ⬜ | |
| 06 | FOX DEN | ⬜ | |
| 07 | Charaktere | ⬜ | (Kanon steht in `kontext.md`, Detaildoku folgt) |
| 08 | Gegner / Schattenorden | ⬜ | |
| 09 | Fahrzeuge | ⬜ | |
| 10 | Gadgets | ⬜ | |
| 11 | UI | 🔄 | Prototyp-HUD/Menü umgesetzt; Doku folgt |
| 12 | HUD | 🔄 | im Prototyp umgesetzt |
| 13 | Animationen | ⬜ | (Platzhalter im Prototyp; echte Sprites offen) |
| 14 | Missionen | ⬜ | |
| 15 | Nebenmissionen | ⬜ | |
| 16 | Bosskämpfe | ⬜ | (Boss Band 0 = Dr. Vorax) |
| 17 | Speicherstände | ⬜ | |
| 18 | Audio | ⬜ | |
| 19 | Optimierung | ⬜ | |
| 20 | Tests | 🔄 | Prototyp-Smoke-Test via Playwright |
| 21 | Release | ⬜ | GitHub Pages Web-App |
| 22+ | Erweiterungen (Band 1, 2, 3 …) | ⬜ | neue `data/levels/`-Dateien, kein Engine-Umbau |

## Web-Prototyp (Vertical Slice)
- 🔄 Engine: Game-Loop, Input (Tastatur+Touch), Kamera, Physik, Szenen
- 🔄 Player: Fynnox-Zustandsautomat (idle/run/jump/doublejump/fall)
- 🔄 Welt: Level „Altstadt – Nacht" aus Daten, Parallax, Plattformen, Tag/Nacht-Umschaltung
- 🔄 Systeme: Kristalle sammeln, HUD (Herzen/Kristalle/Münzen), Startmenü
- ⬜ Echte Sprites/Animationen (aktuell stilechte Platzhalter)
- 🔄 GitHub-Repo + GitHub Pages Deploy

## Bewusst NICHT im aktuellen Schritt
Fertige Story, echte Sprites/Audio, Fahrzeug-Gameplay, FOX-DEN-Interior, Speichersystem,
Unity-Portierung. Jeweils eigener späterer Schritt + eigenes Dokument.
