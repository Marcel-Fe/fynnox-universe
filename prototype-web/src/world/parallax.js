// Parallax-Skyline. Ohne Bild-Assets: prozedurale Häuser-Silhouetten je Ebene,
// einmalig mit festem Seed erzeugt (stabil, kein Flackern). Erzeugt den 2,5D-Tiefeneindruck.

// kleiner deterministischer Zufallsgenerator (mulberry32)
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Parallax {
  constructor(layers, worldW) {
    // Baut je Ebene eine Liste von Gebäuden vor.
    this.layers = layers.map((cfg) => {
      const rng = makeRng(cfg.seed);
      const buildings = [];
      let x = -100;
      const end = worldW * cfg.factor + 400;
      while (x < end) {
        const w = cfg.spacing * (0.7 + rng() * 0.8);
        const h = cfg.minH + rng() * (cfg.maxH - cfg.minH);
        // Fensterraster
        const cols = Math.max(1, Math.floor(w / 16));
        const rows = Math.max(1, Math.floor(h / 22));
        const windows = [];
        for (let c = 0; c < cols; c++)
          for (let r = 0; r < rows; r++)
            if (rng() > 0.45) windows.push({ c, r });
        buildings.push({ x, w, h, cols, rows, windows });
        x += w + 6 + rng() * 10;
      }
      return { cfg, buildings };
    });
  }

  // names: optionale Auswahl einzelner Ebenen (z. B. nur ['near'] vor einem Foto-Hintergrund)
  render(ctx, camera, theme, viewH, names) {
    const W = camera.viewW;
    this.layers.forEach((layer, li) => {
      if (names && !names.includes(layer.cfg.name)) return;
      const offset = camera.parallaxX(layer.cfg.factor);
      const color = theme[layer.cfg.tone];
      const glow = theme.windowGlow;
      const isFront = li === this.layers.length - 1;

      for (const b of layer.buildings) {
        const sx = b.x - offset;
        if (sx > W || sx + b.w < 0) continue; // Culling
        const top = layer.cfg.baseline - b.h;
        ctx.fillStyle = color;
        ctx.fillRect(sx, top, b.w, b.h);
        ctx.fillRect(sx - 2, top, b.w + 4, 4); // Dachkante

        const cw = b.w / b.cols, ch = b.h / b.rows;
        for (const win of b.windows) {
          const wx = sx + win.c * cw + cw * 0.25, wy = top + win.r * ch + ch * 0.25;
          const ww = cw * 0.45, wh = ch * 0.4;
          // weicher Schein (Bloom) nur in der Front-Ebene fürs Performance-Budget
          if (isFront) { ctx.globalAlpha = 0.16; ctx.fillStyle = glow; ctx.fillRect(wx - 3, wy - 3, ww + 6, wh + 6); }
          ctx.globalAlpha = isFront ? 0.75 : 0.5;
          ctx.fillStyle = glow;
          ctx.fillRect(wx, wy, ww, wh);
        }
        ctx.globalAlpha = 1;
      }

      // Atmosphärischer Dunst: hintere Ebenen sanft in die Himmelsfarbe tauchen (Tiefe)
      const hazeA = (1 - layer.cfg.factor) * 0.22;
      if (hazeA > 0.01) {
        ctx.globalAlpha = hazeA;
        ctx.fillStyle = theme.skyBottom;
        ctx.fillRect(0, layer.cfg.baseline - layer.cfg.maxH - 20, W, layer.cfg.maxH + 40);
        ctx.globalAlpha = 1;
      }
    });
  }
}
