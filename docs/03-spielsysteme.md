# 03 – Spielsysteme

> Definiert die Kern-Systeme von Band 0. Jedes System ist eigenständig und über **Daten**
> erweiterbar (siehe [`02-architektur.md`](02-architektur.md)). Legende: ✅ im Prototyp vorhanden ·
> 🔄 teilweise · ⬜ geplant. Kanon-Fakten stammen aus [`../kontext.md`](../kontext.md).

## Übersicht

| # | System | Status | Kurzbeschreibung |
|---|---|---|---|
| 1 | Bewegung & Zustände | ✅ | Laufen, Springen, Doppelsprung, Fallen |
| 2 | Physik & Kollision | ✅ | Gravitation, AABB gegen Plattformen |
| 3 | Kamera & Parallax | ✅ | weicher Follow, mehrschichtige Tiefe |
| 4 | Tag/Nacht | ✅ | Umschaltung + weiches Überblenden |
| 5 | Sammeln & Wirtschaft | 🔄 | Kristalle/Münzen; Shop/Skilltree geplant |
| 6 | HUD & UI | 🔄 | Herzen/Kristalle/Münzen; weitere Screens geplant |
| 7 | Eingabe | ✅ | Tastatur + Touch, Gamepad vorbereitet |
| 8 | Gadgets & Fähigkeiten | ⬜ | Greifhaken, Scanner, Gleiten … |
| 9 | Missionen | ⬜ | Haupt-/Neben-/Detektiv-/Boss-Missionen |
| 10 | NPCs & Dialoge | ⬜ | Tages-/Nachtabläufe, Sprechblasen |
| 11 | Speichern | ⬜ | Autosave, mehrere Spielstände, 100 % |
| 12 | Audio | ⬜ | Musik pro Stadtteil, SFX |

## 1. Bewegung & Zustände ✅
Fynnox ist ein Zustandsautomat: `idle · run · jump · doubleJump · fall`. Genau ein aktiver Zustand,
klare Übergänge. Alle Werte (Geschwindigkeit, Sprungkraft, Doppelsprung an/aus) liegen als **Daten**
in `data/characters.js` — nie im Engine-Code. So bekommt jede künftige Figur eigene Bewegung, ohne
die Engine anzufassen. *(Umgesetzt: `src/entities/player.js`.)*

**Erweiterung:** neue Fähigkeit = neuer Zustand + Freischalt-Flag in den Daten (z. B. `glideEnabled`).

## 2. Physik & Kollision ✅
Gravitation pro Level (`level.gravity`) + **AABB-Kollision** (Rechteck gegen Rechteck), X- und
Y-Achse getrennt aufgelöst. Bewusst einfach und robust für Plattform-Gameplay. *(`src/systems/physics.js`.)*

**Level-Design-Regel:** schwebende Plattformen so setzen, dass der am Boden stehende Fynnox (Kopf bei
y≈440) darunter Kopffreiheit hat und Plattformen von der Seite erreichbar sind — sonst „Kopf-Stoß".

## 3. Kamera & Parallax ✅
Kamera folgt Fynnox weich und bleibt in den Levelgrenzen. Hintergrund in mehreren Ebenen mit
Faktoren (weiter hinten = langsamer) → 2,5D-Tiefe. *(`src/engine/camera.js`, `src/world/parallax.js`.)*
Später ersetzen echte Bild-Ebenen die prozeduralen Silhouetten — ohne Code-Umbau.

## 4. Tag/Nacht ✅
Kernmechanik des Nachtwächter-Konzepts. Zwei Themes pro Level (`themes.day`/`themes.night`), weiches
Überblenden von Himmel, Gebäuden, Licht (Mond ↔ Sonne). *(`src/world/daynight.js`.)*
**Geplant:** Tag = Alltag (Schule, Werkstatt, normale Kleidung), Nacht = Einsätze im Nachtwächter-Anzug.

## 5. Sammeln & Wirtschaft 🔄
- **Kristalle** = Skill-/Premium-Währung, **Münzen** = Shop-Währung (Kanon).
- Vorhanden: Kristalle einsammeln erhöht beide Zähler. *(`src/entities/collectible.js`, `src/main.js`.)*
- **Geplant:** weitere Typen (Abzeichen, Comic-Hefte, Sticker, Kostüm-/Fahrzeugteile, Baupläne,
  Goldene Pfoten, Geheime Akten), Skilltree (Hexagon-Knoten, Doppelsprung = 500 Kristalle), Shop.
- **Erweiterung:** neuer Sammel-Typ = Typ in den Level-Daten + Icon-Mapping im HUD.

## 6. HUD & UI 🔄
Vorhanden: Herzen (Leben), Kristalle, Münzen, Tag/Nacht-Anzeige. *(`src/systems/hud.js`.)*
**Geplant (Kanon):** Inventar, Missionstagebuch, Skilltree, Weltkarte (Schnellreise), Dialog-Panel,
Comic-Sequenzen, Ladebildschirm. Stil: groß, gold-umrandet auf Dunkelblau, animiert.

## 7. Eingabe ✅
Abstraktion auf **Aktionen** (`left/right/jump/action/toggleDayNight`). Tastatur + Touch schreiben in
dieselben Aktionen; Gamepad ist als weitere Quelle vorbereitet. Gameplay kennt keine konkrete Taste.
*(`src/engine/input.js`.)* „Einmal-Druck" (Sprung) vs. „gehalten" (Laufen) sind getrennt.

## 8. Gadgets & Fähigkeiten ⬜
Kanon: Greifhaken (schwingen), Scanner, Rauchkapseln, Multitool, Drohne, Taschenlampe, Gleiten,
Klettern, Schleichen — alle mit Upgrades. Jeweils als eigener Player-Zustand oder Aktion + Daten-Flag.

## 9. Missionen ⬜
Typen: Haupt-, Neben-, Detektiv-, Boss-Mission. Eine Mission = Daten (Ziele, Fortschritt, Belohnung).
Beispiel-Kanon „Schatten über Raven City": Hinweise sammeln → Laternen reparieren → Täter stellen →
Boss **Dr. Vorax**. Rettungseinsätze (Katze/Kind retten, Feuer löschen …) als Missions-Untertypen.

## 10. NPCs & Dialoge ⬜
Jeder NPC (Kanon: Mrs. Maple, Officer Bruno, Mr. Tinker, Grandpa Rocky …) mit Tages-/Nachtablauf,
Dialogen, Emotionen. Dialogsystem: Portrait + Sprechblase + Name + Weiter. Alles datengetrieben.

## 11. Speichern ⬜
Autosave + mehrere Spielstände. Web-Prototyp: `localStorage` (Kristalle, Münzen, Fortschritt,
freigeschaltete Skills, gefundene Sammelobjekte). Später engine-spezifisch.

## 12. Audio ⬜
Musik pro Stadtteil, SFX (Sprung, Kristall, Menü), Wetter-Ambient. Assets in `assets/audio/`,
Auswahl datengetrieben pro Level/Stadtteil.

## Prinzip über allen Systemen
Kein System hartkodiert Inhalt. Neuer Band, Charakter, Gegner, Mission, Stadtteil = **Daten**.
Muss dafür Engine-Code geändert werden, ist es ein Architektur-Fehler (siehe `CLAUDE.md`).
