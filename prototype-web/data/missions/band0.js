// Band 0 – "Die erste Nacht": Story + 4 Einsätze als reine Daten.
// Neuer Einsatz/Band = neue Datei wie diese. Engine/Manager bleiben unangetastet.
// objective.kind: 'collect' (N Kristalle) | 'entities' (alle Missions-Objekte erledigen)
// entities: werden beim Missionsstart in die Welt gesetzt und beim Abschluss entfernt.

export const BAND0_MISSIONS = [
  {
    id: 'm0-erste-nacht',
    type: 'HAUPTMISSION',
    title: 'Die erste Nacht',
    objective: { kind: 'collect', need: 3, text: 'Sammle 3 Energie-Kristalle' },
    reward: { coins: 100, crystals: 0, xp: 200 },
    intro: [
      { speaker: 'Professor Orion', portrait: 'orion', text: 'Fynnox! Kannst du mich hören? Über der Altstadt sind alle Laternen ausgegangen.' },
      { speaker: 'Professor Orion', portrait: 'orion', text: 'Heute ist deine erste Nacht als Nachtwächter. Raven City braucht dich.' },
      { speaker: 'Fynnox', portrait: 'fynnox', text: 'Ich bin bereit, Professor! Was muss ich tun?' },
      { speaker: 'Professor Orion', portrait: 'orion', text: 'Sammle drei Energie-Kristalle, dann lade ich damit deinen Scanner auf. Los geht\'s!' },
    ],
    outro: [
      { speaker: 'Professor Orion', portrait: 'orion', text: 'Perfekt! Scanner aufgeladen. Und... ich empfange einen Hilferuf ganz in der Nähe.' },
    ],
  },
  {
    id: 'm1-katze',
    type: 'NEBENMISSION',
    title: 'Die Katze auf dem Dach',
    objective: { kind: 'entities', text: 'Rette das Kätzchen (spring hinauf!)' },
    entities: [{ type: 'rescue', x: 1128, y: 258, w: 28, h: 30, label: 'Kätzchen' }],
    reward: { coins: 150, crystals: 25, xp: 250 },
    intro: [
      { speaker: 'White Raven', portrait: 'raven', text: 'Da oben, Fynnox. Ein Kätzchen sitzt fest und traut sich nicht herunter.' },
      { speaker: 'Fynnox', portrait: 'fynnox', text: 'Kein Problem. Mit dem Doppelsprung komme ich da hoch!' },
    ],
    outro: [
      { speaker: 'White Raven', portrait: 'raven', text: 'Gut gemacht. Du hast ein warmes Herz — das macht einen echten Nachtwächter aus.' },
      { speaker: 'White Raven', portrait: 'raven', text: 'Aber sieh nur... Rauch! Irgendwo brennt es.' },
    ],
  },
  {
    id: 'm2-feuer',
    type: 'HAUPTMISSION',
    title: 'Feuer in der Altstadt',
    objective: { kind: 'entities', text: 'Lösche die Brände (Aktion halten)' },
    entities: [
      { type: 'fire', x: 1900, y: 470, w: 34, h: 34 },
      { type: 'fire', x: 2150, y: 470, w: 34, h: 34 },
      { type: 'fire', x: 2380, y: 470, w: 34, h: 34 },
    ],
    reward: { coins: 250, crystals: 50, xp: 400 },
    intro: [
      { speaker: 'Fynnox', portrait: 'fynnox', text: 'Drei Feuer! Ich muss sie schnell löschen, bevor sie sich ausbreiten.' },
      { speaker: 'Professor Orion', portrait: 'orion', text: 'Geh nah heran und halte die Aktions-Taste — dein Multitool sprüht Löschschaum.' },
    ],
    outro: [
      { speaker: 'Fynnox', portrait: 'fynnox', text: 'Geschafft! Aber warte... da läuft jemand weg. Der hat das Feuer gelegt!' },
    ],
  },
  {
    id: 'm3-dieb',
    type: 'DETEKTIV-MISSION',
    title: 'Der Schatten-Dieb',
    objective: { kind: 'entities', text: 'Verfolge und schnapp den Dieb!' },
    entities: [{ type: 'thief', x: 2500, y: 452, w: 30, h: 40, label: 'Dieb', levelW: 3200 }],
    reward: { coins: 400, crystals: 100, xp: 600 },
    intro: [
      { speaker: 'White Raven', portrait: 'raven', text: 'Ein Waschbär im Schatten-Umhang. Er darf nicht entkommen — lauf ihm nach!' },
    ],
    outro: [
      { speaker: 'Dieb', portrait: 'thief', text: 'Schon gut, du hast mich! Ich... ich arbeite für Dr. Vorax vom Schattenorden.' },
      { speaker: 'Dieb', portrait: 'thief', text: 'Er will alle Energie-Kristalle der Stadt. Das war erst der Anfang!' },
      { speaker: 'Professor Orion', portrait: 'orion', text: 'Der Schattenorden... Fynnox, du hast Raven City heute Nacht beschützt. Ich bin stolz auf dich.' },
      { speaker: 'Professor Orion', portrait: 'orion', text: 'Aber das war nur der Anfang deines Abenteuers. — ENDE BAND 0, KAPITEL 1 —' },
    ],
  },
];
