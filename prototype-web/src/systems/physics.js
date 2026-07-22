// Physik: Gravitation + AABB-Kollision (achsen-ausgerichtete Rechtecke).
// Bewusst einfach: getrennte X- und Y-Auflösung, robust für Plattform-Gameplay.

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Bewegt eine Entity (mit x,y,w,h,vx,vy,onGround) um einen Schritt und löst
// Kollisionen gegen die Plattformen auf. Gibt zurück, ob sie auf Boden steht.
export function moveAndCollide(entity, platforms, gravity, dt) {
  entity.vy += gravity * dt;

  // --- X-Achse ---
  entity.x += entity.vx * dt;
  for (const p of platforms) {
    if (!rectsOverlap(entity, p)) continue;
    if (entity.vx > 0) entity.x = p.x - entity.w;
    else if (entity.vx < 0) entity.x = p.x + p.w;
    entity.vx = 0;
  }

  // --- Y-Achse ---
  entity.onGround = false;
  entity.y += entity.vy * dt;
  for (const p of platforms) {
    if (!rectsOverlap(entity, p)) continue;
    if (entity.vy > 0) { entity.y = p.y - entity.h; entity.onGround = true; }
    else if (entity.vy < 0) { entity.y = p.y + p.h; }
    entity.vy = 0;
  }
  return entity.onGround;
}
