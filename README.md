# Fynnox Universe — Band 0: Der Anfang

Ein modulares 2,5D-Story-Adventure (Comic-Adventure / Jump & Run) im Fynnox-Universum.
Held: **Fynnox**, der Nachtwächter von **Raven City**.

> © 2026 Marcel Fehse — **Alle Rechte vorbehalten.** Ansehen erlaubt, Nutzung/Kopieren/Bearbeiten
> nur mit schriftlicher Genehmigung. Siehe [`LICENSE`](LICENSE).

> **Status:** Fundament + spielbarer Web-Prototyp (Vertical Slice). Ziel-Engine langfristig Unity/URP.
> Grafik im Prototyp sind stilechte **Platzhalter** — echte Sprites folgen.

## 🎮 Web-App spielen
- **Live (GitHub Pages):** wird nach dem ersten Deploy hier verlinkt.
- **Lokal:** im Ordner `prototype-web/` einen Webserver starten, z. B.
  `python -m http.server 8000` → dann `http://localhost:8000` öffnen.
  (Wichtig: ES-Module brauchen einen Server, ein Doppelklick auf die Datei reicht nicht.)

### Steuerung
- Bewegen: **← →** oder **A / D**
- Springen / **Doppelsprung**: **↑ / W / Leertaste** (zweimal drücken)
- Tag/Nacht wechseln: **N** · am Handy: Touch-Buttons

## 📁 Struktur
| Ordner/Datei | Inhalt |
|---|---|
| [`kontext.md`](kontext.md) | **Projekt-Bibel** — verbindlicher Kanon (Figuren, Welt, Systeme) |
| [`CLAUDE.md`](CLAUDE.md) | Arbeitsregeln fürs Projekt (Modularität, Stil, Konventionen) |
| [`plan.md`](plan.md) | Master-Roadmap mit Status |
| [`docs/`](docs/) | nummerierte Entwicklungsdokumente (Architektur …) |
| [`design/`](design/) | Original-Konzept-Grafiken |
| [`prototype-web/`](prototype-web/) | spielbarer Web-Prototyp (Vanilla JS + Canvas) |
| [`tests/`](tests/) | automatischer Browser-Durchlauf — `node tests/run.mjs` |

## 🧩 Modularität
Charaktere, Level und ganze Comic-Bände sind **Daten**, kein Code. Ein neuer Band = neue Datei in
`prototype-web/data/levels/`, ein neuer Charakter = neuer Eintrag in `prototype-web/data/characters.js`
— der Engine-Code bleibt unangetastet. Details: [`docs/02-architektur.md`](docs/02-architektur.md).
