// Startmenü-Overlay (HTML/CSS, kein Canvas). Buttons wie im Kanon:
// Weiter Spielen / Neues Spiel / Optionen.
// Das Menü kennt den Spielstand nicht — es bekommt nur `hasSave` und die beiden
// Aktionen von main.js. Speichern/Löschen passiert dort, nicht hier.

export function setupMenu(scene, { hasSave = false, onContinue, onNew } = {}) {
  const overlay = document.getElementById('menu');

  const enter = (action) => {
    overlay.classList.add('hidden');
    scene.go('play');
    if (action) action();
  };

  const contBtn = overlay.querySelector('[data-action="continue"]');
  if (contBtn) {
    contBtn.disabled = !hasSave;
    contBtn.classList.toggle('disabled', !hasSave);
    if (!hasSave) contBtn.title = 'Noch kein Spielstand vorhanden';
    contBtn.addEventListener('click', () => { if (hasSave) enter(onContinue); });
  }

  const newBtn = overlay.querySelector('[data-action="new"]');
  if (newBtn) {
    // Ohne Stand ist "Neues Spiel" der Hauptweg — dann trägt es die Hervorhebung.
    if (!hasSave && contBtn) { contBtn.classList.remove('primary'); newBtn.classList.add('primary'); }
    newBtn.addEventListener('click', () => {
      if (hasSave && !confirm('Neues Spiel starten? Dein gespeicherter Fortschritt wird gelöscht.')) return;
      enter(onNew);
    });
  }

  const optBtn = overlay.querySelector('[data-action="options"]');
  const optPanel = document.getElementById('options-panel');
  if (optBtn && optPanel) {
    optBtn.addEventListener('click', () => optPanel.classList.toggle('hidden'));
  }
}
