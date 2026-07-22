# assets/ — Grafik & Ton (Platzhalter-Phase)

Aktuell zeichnet der Prototyp **stilechte Platzhalter** direkt per Canvas (Fynnox-Silhouette,
Kristalle, Skyline). Hier landen später die echten Assets:

- `sprites/` — Charakter-Sprite-Sheets (Fynnox Tag/Nacht, NPCs, Gegner)
- `backgrounds/` — Parallax-Ebenen als Bilder (Altstadt, Hafen, Tech District …)
- `audio/` — Musik pro Stadtteil + SFX (Sprung, Kristall, Menü)

**Einhängen ohne Code-Umbau:** In `../data/characters.js` das Feld `spriteSheet` setzen bzw. in den
Level-Daten Bild-Pfade ergänzen. Der Engine-Code bleibt unverändert (siehe `../../docs/02-architektur.md`).
