# 02 – Architektur (Web-Prototyp)

## Ziel
Eine **modulare** 2,5D-Jump-&-Run-Grundlage, bei der Inhalt (Charaktere, Level, Bände) reine **Daten**
sind und der Engine-Code stabil bleibt. Damit lässt sich das Fynnox Universe erweitern, ohne umzubauen.

## Technik-Entscheidung
- **Vanilla JavaScript + HTML5-Canvas, ES-Module.** Kein Build-Step, keine externen Libraries.
- **Warum:** läuft direkt im Browser, ist für Anfänger lesbar, hat null Abhängigkeits-Risiko und ist
  später sauber nach Unity/URP portierbar (die Konzepte — Game-Loop, Entity-States, datengetriebene
  Level — sind 1:1 übertragbar).
- **Grenze (ehrlich):** Canvas-2D rendert kein „echtes" 3D. 2,5D entsteht hier über **Parallax-Ebenen**
  und Skalierung — genug für den Prototyp; volle 3D-Hintergründe/Lichter kommen mit Unity.

## Schichten (Datenfluss von unten nach oben)

```
data/           reiner Inhalt  ── characters.js, levels/band0-altstadt-nacht.js
   │  (wird geladen von)
src/world/      Welt-Aufbau    ── level.js, parallax.js, daynight.js
src/entities/   Spielfiguren   ── player.js (Zustandsautomat), collectible.js
src/systems/    Regeln         ── physics.js (Gravitation, AABB), hud.js
src/engine/     Kernschleife   ── loop.js, input.js, camera.js, scene.js
src/main.js     Bootstrap ── verbindet alles, startet Game-Loop
index.html      Canvas + Touch-Buttons + Menü-Overlay
```

**Regel:** Höhere Schichten kennen tiefere, nie umgekehrt. `engine/` weiß nichts über „Fynnox" oder
„Altstadt" — es kennt nur Entities, Rects und Szenen. Fynnox-Wissen lebt ausschließlich in `data/`.

## Kernbausteine

### Game-Loop (`engine/loop.js`)
Fester Zeitschritt (Fixed Timestep, 60 Hz) für die Physik, getrennt vom Rendern. Das macht die
Bewegung framerate-unabhängig — auf schnellen und langsamen Geräten gleich schnell.

### Input (`engine/input.js`)
Abstrahiert Eingaben zu **Aktionen** (`left`, `right`, `jump`, `action`, `toggleDayNight`). Tastatur
und Touch-Buttons schreiben in dieselben Aktionen → Gameplay-Code kennt keine konkrete Taste.
Gamepad ist als weitere Quelle vorgesehen.

### Player-Zustandsautomat (`entities/player.js`)
Zustände `idle · run · jump · doubleJump · fall`. Genau ein aktiver Zustand; Übergänge sind klar
definiert (z. B. `jump → doubleJump` nur wenn Sprung noch verfügbar). Werte (Speed, Sprungkraft,
Doppelsprung an/aus) kommen aus `data/characters.js` — nicht hartkodiert.

### Physik (`systems/physics.js`)
Gravitation + **AABB-Kollision** (achsen-ausgerichtete Rechtecke) gegen die Plattformen des Levels.
Bewusst einfach und robust; reicht für Plattform-Gameplay.

### Datengetriebene Level (`data/levels/*.js`)
Ein Level ist ein Objekt: `id`, `name`, `theme` (Tag/Nacht-Farben), `size`, `platforms[]`,
`collectibles[]`, `parallaxLayers[]`, `spawn`. `world/level.js` baut daraus die Szene — **kein**
Level-spezifischer Code in der Engine. Neuer Level/Band = neue Datei, sonst nichts.

### Datengetriebene Charaktere (`data/characters.js`)
Jeder Charakter: Farben (aus der Kanon-Palette), Maße, Bewegungswerte, Fähigkeiten. Der Prototyp
zeichnet daraus eine **stilechte Platzhalter-Silhouette**. Ein `spriteSheet`-Feld ist vorgesehen —
sobald echte Grafik existiert, wird sie hier eingehängt, ohne Code-Änderung.

## Erweiterbarkeit (Masterprompt-Kernforderung)
| Will ich … | … dann tue ich | Engine-Code ändern? |
|---|---|---|
| neuen Level / Comic-Band | Datei in `data/levels/` anlegen, in Level-Liste eintragen | nein |
| neuen Charakter/NPC | Eintrag in `data/characters.js` | nein |
| neues Sammelobjekt-Typ | Typ in `data`-Level + Icon in `hud.js`-Mapping | minimal |
| echte Sprites | `spriteSheet` in `characters.js`/Level füllen | nein |
| neue Fähigkeit (z. B. Greifhaken) | neuer Zustand in `player.js` + Freischalt-Flag in `data` | ja (bewusst) |

## Verhältnis zum Unity-Ziel
Die Schichtung entspricht später: `data/` → ScriptableObjects, `engine/`+`systems/` → MonoBehaviours/
Systeme, `entities/` → Prefabs mit State-Machines. Der Prototyp ist die lauffähige Blaupause.
