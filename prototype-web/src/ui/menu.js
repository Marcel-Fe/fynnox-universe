// Startmenü-Overlay (HTML/CSS, kein Canvas). Buttons wie im Kanon:
// Weiter Spielen / Neues Spiel / Optionen. Ruft onStart() beim Spielstart.

export function setupMenu(scene, onStart) {
  const overlay = document.getElementById('menu');
  const startBtns = overlay.querySelectorAll('[data-action="start"]');
  startBtns.forEach((b) => b.addEventListener('click', () => {
    overlay.classList.add('hidden');
    scene.go('play');
    onStart();
  }));

  const optBtn = overlay.querySelector('[data-action="options"]');
  const optPanel = document.getElementById('options-panel');
  if (optBtn && optPanel) {
    optBtn.addEventListener('click', () => optPanel.classList.toggle('hidden'));
  }
}
