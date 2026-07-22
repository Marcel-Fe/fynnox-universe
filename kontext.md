# Fynnox Universe – Projekt-Bibel (`kontext.md`)

> **Single Source of Truth.** Dieses Dokument ist der verbindliche Kanon. Es wurde aus den
> Konzept-Bildern in `design/` extrahiert. Alles im Spiel, in Comics und in Merch muss dazu passen.
> Neue Ideen werden hier zuerst eingetragen, **bevor** sie in Code oder Assets wandern.
>
> **Legende:** `?` = im Design bewusst offen. `⚠️` = Unstimmigkeit zwischen zwei Design-Bildern,
> hier bewusst festgehalten und mit gewählter Kanon-Entscheidung markiert.

---

## 1. Kern-Identität

- **Titel:** Fynnox Universe — **Band 0: „Der Anfang"**
- **Claim:** „Helden. Freunde. Abenteuer."
- **Genre:** 2,5D Story-Adventure / Comic-Adventure mit Jump & Run, Exploration, Rätseln,
  Detektiv-Elementen — ein Familienabenteuer.
- **Zielgruppe:** 6+, Familien, Nintendo-Spieler, Disney-/Pixar-Fans.
- **Ton:** Warm, freundlich, humorvoll, emotional, viel Liebe zum Detail. **Kein** Horror,
  **kein** Realismus, **kein** Anime, keine düsteren Welten.
- **Welt-Regel:** Nur Tiere, keine Menschen. Jede Figur ist ein vermenschlichtes Tier.

## 2. Grafik- & Stil-Kanon

- **Stil-Referenz:** Pixar / DreamWorks / Nintendo — hochwertig, weich, freundlich, kindgerecht.
- **Technik-Ziel:** 2,5D, seitliche Kamera, Parallax, 3D-Hintergründe/Licht/Partikel,
  animierte Sprites. Ziel-Engine langfristig **Unity URP, 60 FPS, Web- & Mobile-optimiert**.
  (Erster Prototyp: Web/Canvas — siehe `docs/02-architektur.md`.)
- **Grundstimmung:** überwiegend **Nacht** — der Nachtwächter-Kern des Spiels.

### Farbwelt (verbindliche Palette)

| Rolle | Farbe | Einsatz |
|---|---|---|
| Primär / Hintergrund | **Dunkelblau** (`#0E1A2B`–`#16233A`) | Nachtstadt, UI-Flächen |
| Akzent / UI | **Gold** (`#E9A93B` / `#F5C560`) | Logo, Buttons, Rahmen, Pfoten-Symbol |
| Held / Energie | **Orange** (`#E8722B`) | Fynnox' Fell, warme Highlights |
| Böse / Schattenorden | **Lila** (`#7A3CC4` / `#B36BFF`) | Gegner, dunkle Energie |
| Kristall / Tech | **Türkis/Cyan** (`#2FD3E0`) | Kristalle, Gadgets, Hologramme |

## 3. Helden

> Format je Figur: Spezies · Alter · Größe · Charakter · Liebt/Hasst · Ausrüstung · Stärken · Symbol.

### Fynnox — „Der Nachtwächter" (Protagonist)
- **Fuchs** · 12 Jahre · 110 cm ⚠️ (Vergleichs-Chart nennt 120 cm; Kanon = **110 cm** vom Charakterbogen)
- Mutig, clever, freundlich, hilfsbereit, gerecht.
- **Liebt:** Erfinden, Abenteuer, seine Freunde. **Hasst:** Ungerechtigkeit, Lügen, Aufgeben.
- **Zwei Outfits:** *Tag* = Hoodie (blau), Jeans, Sneaker (rot), Rucksack. *Nacht (Nachtwächter)* =
  Anzug, Cape (dunkelblau), Maske, Goggles.
- **Ausrüstung:** Greifhaken, Scanner, Multitool, Rauchkapseln, Taschenlampe.
- **Stärken:** Mut, Intelligenz, Technik, Schnelligkeit, Freundlichkeit.
- **Symbol:** goldene Pfote auf Dunkelblau.

### White Raven — „Die geheimnisvolle Beschützerin"
- **Schneeeule** · Alter `?` · 105 cm · geheimnisvoll, ruhig, weise, loyal. **Kann fliegen.**
- Liebt Stille, Wissen, Fynnox (Vertrauen). Hasst Verrat, Chaos, Grausamkeit.
- Ausrüstung: leichter Umhang, Federspitzen, Rauchgranaten, Nachtsichtmaske.
- Stärken: Heimlichkeit, Weisheit, Kampfkunst, Beobachtung. **Symbol:** weiße Feder auf Schwarz.

### Professor Orion — „Der weise Erfinder" (Mentor)
- **Uhu** · 58 Jahre · 115 cm · weise, geduldig, neugierig, humorvoll.
- Liebt Wissenschaft, Erfindungen, Bücher. Hasst Unordnung, Ignoranz.
- Ausrüstung: Energie-Kristall, Hologramm-Tablet, Werkzeugkoffer, Buch der Erfindungen.
- Stärken: Wissen, Erfindungen, Strategie, Geduld. **Symbol:** Zahnrad.

### Bo — „Der starke Bär" (bester Freund)
- **Bär** · 12 Jahre ⚠️ (Detailbogen nennt 14; Kanon = **12**) · 125 cm · stark, loyal, mutig, hilfsbereit.
- Liebt Honig, Sport/Herausforderungen, Freunde. Hasst Gemeinheit, Aufgeben.
- Ausrüstung: Rucksack, Kletterseil, Energie-Riegel.
- Stärken: Stärke, Loyalität, Ausdauer, Humor. **Symbol:** Pfote.

### Lily — „Die schnelle Läuferin"
- **Hase** · 11 Jahre · 125 cm ⚠️ (Chart nennt 102 cm) · schnell, energiegeladen, clever, akrobatisch.
- Liebt Laufen, Sport, Wettbewerbe. Hasst Langsamkeit, Langeweile.
- Ausrüstung: Laufschuhe, Springseil, Mini-Boost.
- Stärken: Schnelligkeit, Energie, Akrobatik, Kreativität. **Symbol:** Blitz.

### Milo — „Der Tüftler"
- **Biber** ⚠️ (Art wirkt waschbär-ähnlich; Label = **Biber**) · 12 Jahre · 125 cm · intelligent, kreativ, manchmal chaotisch.
- Liebt Erfinden, Basteln, Technik. Hasst Regeln, Langeweile.
- Ausrüstung: Schraubenschlüssel, Mini-Drohne, Werkzeuggürtel, Baupläne.
- Stärken: Erfinden, Technik, Geduld, Logik. **Symbol:** Schraubenschlüssel.

> ⚠️ **Namens-Hinweis:** Auf einem frühen Merch-Bild taucht eine violette Katze **„Lira – Die
> Schattenjägerin"** als Actionfigur auf. In allen späteren Charakter-Bibeln fehlt sie; dort ist
> **Lily (Hase)** kanonisch. Kanon-Entscheidung: **Lily** ist fix; „Lira" gilt als verworfener
> Früh-Entwurf, bis das Design sie explizit wieder aufnimmt.

## 4. Der Schattenorden (Antagonisten)

| Figur | Rolle | Spezies | Größe | Ziel | Symbol |
|---|---|---|---|---|---|
| **Shadow Claw** | Der Anführer | Schwarzer Wolf | 118 cm | Macht an sich reißen, Raven City kontrollieren | lila Kralle |
| **Night Howler** | Der Jäger | Werwolf ⚠️ (Übersicht: Hyäne; Kanon = Werwolf) | 120 cm | Fynnox wegjagen, Chaos verbreiten | gelber Wolfskopf |
| **Dr. Vorax** | Meister der Energie (**Boss Band 0**) | Krokodil | 125 cm | Energie-Kristall stehlen, Stadt unterwerfen | grünes Zahnrad |
| **The Void** | Das Nichts | Schattenwesen | variabel | alles Licht auslöschen | lila Portal |

- **Shadow Claw:** kalt, berechnend, listig. Ausr.: Schattenklinge, Energiepeitsche, Umhang, Kristall-Amulett.
- **Night Howler:** wild, impulsiv, meisterhafter Spurensucher. Ausr.: Kralle, Netzwerfer, Nachtsicht.
- **Dr. Vorax:** intelligent, manipulativ, gierig. Ausr.: Energie-Kristall, Hologramm-Projektor,
  Kraftfeld-Generator, Laser-Handschuh.
- **The Void:** gefühlskalt, zerstörerisch, aus reiner Negativenergie. Fähigkeiten: Unsichtbarkeit,
  Gestaltwandel, dunkle Energie.

## 5. NPCs (Bewohner von Raven City)

Mr. Finch (Buchhändler) · Mrs. Maple (Bäckerin, Eichhörnchen) · Captain Wave (Hafenmeister) ·
Officer Bruno (Polizist) · Nurse Felicia (Krankenpflegerin) · Mr. Tinker (Uhrmacher) ·
Ms. Bloom (Floristin) · Grandpa Rocky (Leuchtturmwärter) · Teacher Paw (Lehrerin) ·
Posty (Postbote) · Tommy (Schüler, Fuchs).

> Jeder NPC braucht laut Design: Wohnung, Beruf, Tages-/Nachtablauf, Dialoge, Emotionen, Probleme,
> Lieblingsorte, wiederkehrende Geschichten. (Details folgen in `docs/`-Charakterdokumenten.)

## 6. Die Welt: Raven City

Lebendige, freundliche Stadt — Mischung aus London/Hamburg/Amsterdam/Edinburgh, aber eigenständig.
Kanäle, Brücken, Parks, Hafen, Gassen, viele Pflanzen & Lichter.

**Stadtteile** (jeder mit eigener Musik, Farben, NPCs, Geschichte, Missionen, Geheimnissen):
`Altstadt (Old Town)` · `Hafen (Harbor District)` · `Riverside` · `Green Park` · `Tech District` ·
`School District` · `Leuchtturm` · `Museumsviertel`.

**Gebäude:** Rathaus, Polizeistation, Schule, Museum, Bibliothek, Werkstatt, Krankenhaus, Bahnhof,
Leuchtturm, Wasserturm, U-Bahn-Station, Speicherhaus, Café, Blumenladen, Parkvilla.

**Innenräume:** Fynnox' Zimmer, Wohnzimmer, Küche, Schlafzimmer, Werkstatt, Schulklasse, Bibliothek,
Polizeistation, Krankenzimmer, Prof. Orions Labor, FOX-DEN-Eingang, FOX-DEN-Kommandozentrale.

**Weitere Umgebungen (über die Stadt hinaus):** Wald, Strand, Vulkan, Eislandschaft, Kanalisation,
Tech-Labor, Verlassene Ruinen, Wolkeninsel.
**Geheimorte/Dungeons:** Geheime Höhle, Alte Katakomben, Verlassener U-Bahn-Tunnel, Tech-Bunker.

**Wetter/Tageszeiten:** Sonnig, Regen, Schnee, Herbst, Nebel, Gewitter, Sonnenuntergang, Tag, Nacht.

### Tag & Nacht (Kernmechanik)
- **Tag:** Fynnox in Alltagskleidung — Schule, Freunde, Werkstatt, Bibliothek, Erfindungen.
- **Nacht:** Nachtwächter-Anzug — Dächer erkunden, schleichen, Hinweise sammeln, Schurken verfolgen,
  Bewohner retten.

## 7. FOX DEN (geheimes Hauptquartier)

Komplette unterirdische Basis, **wächst im Spielverlauf** (Ausbaustufe im Design z. B. 3/5). Räume:
Kommandozentrale, Werkstatt, Bibliothek, Trainingshalle, Fahrzeuggarage, Trophäenraum, Schlafbereich,
Küche, Geheimarchiv, Drohnenhangar, Wartungstunnel, Aufzüge, Fluchttunnel, Geheimtüren, versteckte Eingänge.

## 8. Fahrzeuge

**Fox Bike · Fox Car · Fox Glider · Fox Drone.** Jedes mit Animationen, Sound, Licht, Upgrades,
Garagen-Platz, Skins. Design-Sprache: dunkel (schwarz/dunkelblau) mit goldenen/orangen Leuchtkanten.

## 9. Gadgets

Scanner · Greifhaken · Rauchkapseln · Multitool · Drohne · Fox Phone · Kommunikator · Taschenlampe ·
Hologrammprojektor. **Alle mit Upgrades** (z. B. Rauchkapsel → Drohne → Schallköder → Energie-Schild).

## 10. Fähigkeiten & Ingame-Aktionen

- **Fähigkeiten (Skilltree):** Springen, **Doppelsprung**, Klettern, Schleichen, Greifen, Gleiten.
- **Ingame-Aktionen:** Idle, Laufen, Springen, Doppelsprung, Rutschen, Klettern, Greifhaken (schwingen),
  Scanner, Schleichen, Interagieren.
- Skilltree = Hexagon-Knoten, freischalten kostet **Kristalle** (Bsp. Doppelsprung = 500).

## 11. Missionen

- **Typen:** Hauptmission, Nebenmission, Detektiv-Mission, Boss-Mission.
- **Rettungseinsätze:** Katze retten, Kind retten, von Schurken befreien, Feuer löschen, verletztes
  Tier helfen, Menschen evakuieren, Stromausfall beheben, Hilfe im Hafen/Park/auf Dächern.
- **Beispiel-Mission (Band 0):** *„Schatten über Raven City"* — jemand sabotiert nachts die Laternen
  der Altstadt. Ziele: Hinweise sammeln (0/3), Laternen reparieren (0/5), Täter stellen.
  Belohnung: 500 Münzen + 100 Kristalle. Spur führt letztlich zu **Dr. Vorax** (Boss).

## 12. Sammelsystem

Kristalle (Währung/Skills) · Münzen (Währung/Shop) · Abzeichen · Comic-Hefte · Sticker · Kostümteile ·
Fahrzeugteile · Erfindungen/Baupläne · Goldene Pfoten · Geheime Akten.

## 13. UI / HUD (Design-Kanon)

- **Hauptmenü:** Weiter Spielen · Neues Spiel · Optionen · Extras — mit Fynnox-Artwork, Mond, Logo.
- **HUD:** Herzen (Leben) · Kristalle (türkis) · Münzen (gold) · Pfoten · Pause. Tag-/Nacht-Variante.
- **Touch-Steuerung:** links/rechts, Springen, Aktion (Pfote), Greifhaken.
- **Screens:** Inventar (Ausrüstung/Gadgets/Sammelobjekte), Skilltree, Missionstagebuch (Ziele +
  Belohnung), Shop (Kostüme/Gadgets/Sammelobjekte, Preis in Kristallen), Weltkarte (Icons: Haupt-/
  Nebenmission, Geschäft, Geheimnis, Schnellreise), Dialogsystem (Portrait + Sprechblase + Name),
  Comic-Sequenzen (Panels + Sprechblasen), Ladebildschirm (Fynnox-Silhouette + Balken).
- **Ton der Buttons:** groß, animiert, gold-umrandet auf Dunkelblau. Bedienbar per Controller, Touch,
  Maus, Gamepad.

## 14. Story-Haltung (Band 0)

Langsam, emotional, humorvoll, viele Dialoge & Zwischensequenzen. Die Spieler sollen Fynnox
**kennenlernen, bevor** er zum Helden wird. Zwischensequenzen wirken wie animierte Comicseiten.
Spieldauer-Ziel: 20–30 h Hauptstory, 50+ h mit Nebenmissionen & Sammlung.

## 15. Quellen (Design-Bilder in `design/`)

Merch-Übersicht (2×), Charakter-Übersicht, Charakter-Turnarounds (Helden + Schattenorden),
Raven City / Gebäude / Umgebungen, UI/HUD-Mockups (2×), Ingame-Aktionen & Rettungsszenen,
Häuser & Architektur. Die drei zusätzlichen PNGs sind Re-Renders bereits erfasster Inhalte.
