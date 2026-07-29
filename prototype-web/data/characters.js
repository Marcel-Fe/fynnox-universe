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
    moveSpeed: 260,
    jumpVelocity: 720,
    doubleJumpEnabled: true, // Skilltree-Fähigkeit aus dem Kanon
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
  },
};
