// Level als reine Daten. Neuer Level / neuer Comic-Band = neue Datei wie diese.
// Koordinaten in Weltpixeln, y zeigt nach unten. Ursprung oben-links.

export const BAND0_ALTSTADT_NACHT = {
  id: 'band0-altstadt-nacht',
  name: 'Altstadt – Nacht',
  band: 0,
  size: { w: 3200, h: 540 },
  spawn: { x: 120, y: 380 },
  gravity: 2000,
  // Echtes Hintergrundbild (aus design/, freigestellt/zugeschnitten).
  background: 'assets/backgrounds/altstadt-nacht.png',

  // Tag/Nacht-Themes (Kernmechanik). daynight.js blendet zwischen beiden.
  themes: {
    night: {
      skyTop: '#0B1424', skyBottom: '#1B2C48',
      buildingBack: '#132135', buildingMid: '#0F1B2E', buildingFront: '#0A1422',
      windowGlow: '#F5C560', ground: '#0D1826', groundTop: '#1E3350',
      moon: true, ambient: 'rgba(20,40,80,0.25)',
    },
    day: {
      skyTop: '#7FB4E6', skyBottom: '#CFE6F7',
      buildingBack: '#8FA6C4', buildingMid: '#6E86A8', buildingFront: '#4E688A',
      windowGlow: '#FBE7A8', ground: '#5A4634', groundTop: '#7A6046',
      moon: false, ambient: 'rgba(255,240,200,0.10)',
    },
  },

  // Parallax-Ebenen: je weiter hinten, desto kleiner der Faktor (bewegt sich langsamer).
  // seed steuert die prozedurale Skyline in parallax.js (stabil, kein Flackern).
  parallaxLayers: [
    { name: 'far',  factor: 0.25, seed: 11, baseline: 470, minH: 120, maxH: 300, spacing: 90, tone: 'buildingBack'  },
    { name: 'mid',  factor: 0.50, seed: 27, baseline: 490, minH: 90,  maxH: 240, spacing: 70, tone: 'buildingMid'   },
    { name: 'near', factor: 0.80, seed: 43, baseline: 505, minH: 60,  maxH: 170, spacing: 55, tone: 'buildingFront' },
  ],

  // Begehbare Plattformen (AABB). Erste = durchgehender Boden.
  // Kopffreiheit: der am Boden stehende Fynnox hat den Kopf bei y=440, daher liegen
  // alle schwebenden Plattform-Unterkanten darüber (y+h <= 428). Spawn-Bereich (x<600)
  // bleibt frei von Plattformen -> immer freier Anlauf zum Springen.
  // oneWay: Schwebeplattform — von unten springt man hindurch, gelandet wird nur von oben.
  platforms: [
    { x: 0,    y: 500, w: 3200, h: 40 },   // Boden (massiv)
    { x: 620,  y: 400, w: 150,  h: 18, oneWay: true },
    { x: 860,  y: 340, w: 140,  h: 18, oneWay: true },
    { x: 1120, y: 290, w: 140,  h: 18, oneWay: true },
    { x: 1380, y: 350, w: 150,  h: 18, oneWay: true },
    { x: 1640, y: 410, w: 150,  h: 18, oneWay: true },
    { x: 1900, y: 360, w: 140,  h: 18, oneWay: true },
    { x: 2160, y: 300, w: 150,  h: 18, oneWay: true },
    { x: 2420, y: 370, w: 160,  h: 18, oneWay: true },
    { x: 2700, y: 405, w: 150,  h: 18, oneWay: true },
    { x: 2960, y: 360, w: 150,  h: 18, oneWay: true },
  ],

  // Sammelobjekte: hier Kristalle (Kanon-Währung/Skills).
  // Ein paar bodennah im Anlauf-Bereich (leicht einsammelbar), der Rest über Plattformen.
  collectibles: [
    { type: 'crystal', x: 260,  y: 455 },
    { type: 'crystal', x: 400,  y: 455 },
    { type: 'crystal', x: 540,  y: 455 },
    { type: 'crystal', x: 690,  y: 350 },
    { type: 'crystal', x: 930,  y: 290 },
    { type: 'crystal', x: 1190, y: 240 },
    { type: 'crystal', x: 1450, y: 300 },
    { type: 'crystal', x: 1710, y: 360 },
    { type: 'crystal', x: 1970, y: 310 },
    { type: 'crystal', x: 2230, y: 250 },
    { type: 'crystal', x: 2490, y: 320 },
    { type: 'crystal', x: 2770, y: 355 },
    { type: 'crystal', x: 3030, y: 455 },
  ],
};
