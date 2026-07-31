# Tests — automatischer Durchlauf im echten Browser

Prüft den Web-Prototyp so, wie ein Spieler ihn erlebt: echter Chromium, echtes
Anklicken, echte Tasten. Kein Test-Framework, keine Projekt-Abhängigkeit —
Playwright wird zur Laufzeit gesucht (global oder im npx-Cache).

## Starten

```bash
node tests/run.mjs              # alle Suiten
node tests/run.mjs save         # nur die Speicherstände
node tests/run.mjs durchlauf    # nur den kompletten Durchlauf
```

Der Runner startet selbst einen statischen Server auf `127.0.0.1:8123` —
`python -m http.server` ist dafür nicht nötig. Exit-Code 0 = alles grün.

Fehlt Playwright, sagt der Runner es und nennt den Befehl:
`npx playwright@latest install chromium`

## Was drin ist

| Datei | Prüft |
|---|---|
| `save.test.mjs` | Kapitel 17: „Weiter Spielen" vs. „Neues Spiel", Sichern beim Seitenwechsel und beim Kristall, Wiederherstellen aller Werte, kaputter Stand blockiert nicht |
| `playthrough.test.mjs` | Alle fünf Einsätze von Band 0 bis zum Finale, Speicher-Checkpoint nach jedem Einsatz, Fortsetzen mitten im Spiel und nach dem Ende |
| `harness.mjs` | Server, Playwright-Auflösung, Prüf-Helfer, Spiel-Griffe |

Screenshots landen in `tests/.out/` (nicht im Repo).

## Regeln für neue Tests

- Nur über die Test-API `window.__fynnox` in den Spielzustand greifen — nie in
  interne Module hineinfassen.
- Jeder JS-Fehler in der Konsole lässt den Test scheitern. Das ist Absicht.
- Positionen dürfen gesetzt werden (`g.put`), wenn die Steuerung nicht der
  Prüfgegenstand ist. Wichtig: nach dem Setzen fällt Fynnox — Aktionstaste
  ohne Wartezeit dazwischen drücken, sonst ist er aus der Reichweite.
