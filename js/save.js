// localStorage への保存と読み込み。壊れたデータも安全な値に直して読む。
function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ nextId, selected, flock }));
  } catch (e) {}
}
function normalizeBird(b, i) {
  const id = Number.isFinite(+b.id) ? +b.id : i + 1;
  const variant = Number.isFinite(+b.variant) ? Math.abs(+b.variant) % variants.length : id % variants.length;
  return {
    ...b,
    id,
    variant,
    parent: b.parent ?? null,
    name: b.name || null,
    age: Number.isFinite(+b.age) ? Math.max(0, +b.age) : 6,
    warmth: Number.isFinite(+b.warmth) ? Math.max(0, +b.warmth) : 3,
    food: Number.isFinite(+b.food) ? clamp(+b.food) : 75,
    happy: Number.isFinite(+b.happy) ? clamp(+b.happy) : 75,
    energy: Number.isFinite(+b.energy) ? clamp(+b.energy) : 75,
    alive: b.alive !== false,
    laid: !!b.laid,
    x: Number.isFinite(+b.x) ? Math.max(12, Math.min(88, +b.x)) : 25 + ((i * 13) % 55),
    y: Number.isFinite(+b.y) ? Math.max(25, Math.min(85, +b.y)) : 40 + ((i * 7) % 30),
  };
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem("bird-life-save-v1");
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (!Array.isArray(d.flock)) return false;
    flock = d.flock.filter((b) => b && typeof b === "object").map(normalizeBird);
    for (const b of flock) {
      if (!b.name && b.warmth >= 3) b.name = uniqueName(b.id);
      if (!b.genes || !b.genesVersion) {
        b.genes = {
          body: COLORS[(b.id - 1) % COLORS.length],
          belly: BELLY[(b.id * 2) % BELLY.length],
          pattern: PATTERNS[(b.id - 1) % PATTERNS.length],
          accent: COLORS[(b.id + 4) % COLORS.length],
        };
        b.genesVersion = 2;
      }
    }
    nextId = Math.max(Number(d.nextId) || 1, ...flock.map((b) => b.id + 1));
    selected = flock.some((b) => b.id === d.selected) ? d.selected : flock[0]?.id || 1;
    return flock.length > 0;
  } catch (e) {
    return false;
  }
}
