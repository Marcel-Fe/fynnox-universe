// Datengetriebene Charaktere. Kanon: siehe ../../kontext.md
// Der Engine-Code kennt keine konkreten Figuren — er liest nur diese Werte.
// Neue Figur = neuer Eintrag. Kein Engine-Code muss dafür geändert werden.

export const PALETTE = {
  darkBlue: '#0E1A2B',
  darkBlue2: '#16233A',
  gold: '#E9A93B',
  goldLight: '#F5C560',
  orange: '#E8722B',
  orangeLight: '#F79A57',
  purple: '#7A3CC4',
  crystal: '#2FD3E0',
  cream: '#F4E9D6',
};

export const CHARACTERS = {
  fynnox: {
    id: 'fynnox',
    name: 'Fynnox',
    title: 'Der Nachtwächter',
    species: 'Fuchs',
    // Bewegungswerte (px/s). Bewusst hier, nicht im Engine-Code.
    moveSpeed: 285,
    jumpVelocity: 730,   // gehaltener Sprung erreicht wie bisher gut 130 px Höhe
    doubleJumpEnabled: true, // Skilltree-Fähigkeit aus dem Kanon
    // Lauf- und Sprunggefühl. Ohne diese Werte bewegt sich die Figur schlagartig;
    // mit ihnen beschleunigt sie, läuft aus und der Sprung hört auf die Taste.
    motion: {
      accel: 1750,        // Beschleunigung am Boden (px/s²)
      friction: 2400,     // Auslaufen ohne Eingabe
      airAccel: 1250,     // Steuerung in der Luft
      airDrag: 500,
      turnBoost: 2.3,     // schnelleres Umdrehen (Bremsspur-Gefühl)
      jumpCut: 0.42,      // Taste früh loslassen = kleinerer Sprung
      coyoteTime: 0.10,   // kurz nach der Kante springt es trotzdem noch
      jumpBuffer: 0.12,   // kurz vor der Landung gedrückt = zählt bei Landung
      gravityFall: 1.28,  // fällt etwas schneller als er steigt
      maxFall: 980,
    },
    width: 44,
    height: 60,
    colors: {
      fur: PALETTE.orange,
      furLight: PALETTE.orangeLight,
      belly: PALETTE.cream,
      cape: PALETTE.darkBlue2,
      capeTrim: PALETTE.gold,
      emblem: PALETTE.gold,
      goggles: PALETTE.crystal,
    },
    // Echtes Fynnox-Artwork (aus dem Charakter-Sheet freigestellt). Ist es gesetzt,
    // rendert der Player das Bild statt der Platzhalter-Silhouette.
    spriteSheet: 'assets/sprites/fynnox.png',
    // Kopfbild für HUD-Avatar und Dialoge
    portrait: 'assets/sprites/portrait-fynnox.png',
    // Puppet-Animation: dasselbe Artwork, in getrennt bewegliche Teile zerlegt.
    // Alle Teile haben die Leinwandgröße von spriteSheet -> deckungsgleich zeichenbar.
    // Fehlt eine Datei, fällt der Player automatisch auf spriteSheet zurück.
    puppet: {
      body: 'assets/sprites/fynnox-body.png',
      tail: 'assets/sprites/fynnox-tail.png',
      leg: 'assets/sprites/fynnox-leg.png',
      // Drehpunkte relativ zur Grafik (0 = links/oben, 1 = rechts/unten)
      hip: { x: 0.60, y: 0.75 },
      tailRoot: { x: 0.50, y: 0.73 },
      // Versatz des hinteren Beins (Tiefenwirkung)
      backLeg: { x: 0.09, y: -0.025, brightness: 0.82 },
      stepRate: 13,      // Schritte pro Sekunde * 2π
      stepAngle: 0.46,   // maximaler Beinausschlag im Bogenmaß
    },
  },
};
