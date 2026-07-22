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

  render(ctx, camera, theme, viewH) {
    for (const layer of this.layers) {
      const offset = camera.parallaxX(layer.cfg.factor);
      const color = theme[layer.cfg.tone];
      ctx.fillStyle = color;
      for (const b of layer.buildings) {
        const sx = b.x - offset;
        if (sx > ctx.canvas.width || sx + b.w < 0) continue; // Culling
        const top = layer.cfg.baseline - b.h;
        ctx.fillRect(sx, top, b.w, b.h);
        // Dach-Detail
        ctx.fillRect(sx - 2, top, b.w + 4, 4);
        // Fenster (leuchten)
        ctx.fillStyle = theme.windowGlow;
        const cw = b.w / b.cols, ch = b.h / b.rows;
        for (const win of b.windows) {
          ctx.globalAlpha = 0.55;
          ctx.fillRect(sx + win.c * cw + cw * 0.25, top + win.r * ch + ch * 0.25, cw * 0.45, ch * 0.4);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = color;
      }
    }
  }
}
