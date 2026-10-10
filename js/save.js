// localStorage への保存と読み込み。壊れたデータも安全な値に直して読む。
function save() {
  try {
    if (gameSlots) saveSlot();
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameData()));
  } catch (e) {}
}
const SLOTS_KEY = "bird-life-games-v1";
function saveSlot() {
  const slot = gameSlots.slots.find((s) => s.id === gameSlots.activeId);
  slot.data = gameData();
  localStorage.setItem(SLOTS_KEY, JSON.stringify(gameSlots));
}
function loadSlots() {
  try {
    const d = JSON.parse(localStorage.getItem(SLOTS_KEY));
    if (
      d &&
      Number.isSafeInteger(d.nextId) &&
      Array.isArray(d.slots) &&
      d.slots.length &&
      d.slots.every(
        (s) =>
          Number.isSafeInteger(s.id) &&
          typeof s.name === "string" &&
          Array.isArray(s.data?.flock) &&
          s.data.flock.length,
      ) &&
      new Set(d.slots.map((s) => s.id)).size === d.slots.length &&
      d.nextId > Math.max(...d.slots.map((s) => s.id)) &&
      d.slots.some((s) => s.id === d.activeId)
    ) {
      gameSlots = d;
      return load(JSON.stringify(d.slots.find((s) => s.id === d.activeId).data));
    }
  } catch (e) {}
  gameSlots = null;
  return load();
}
function initializeSlots() {
  if (!gameSlots)
    gameSlots = { activeId: 1, nextId: 2, slots: [{ id: 1, name: "ゲーム1", data: gameData() }] };
  renderSlots();
}
function renderSlots() {
  el("savedGames").replaceChildren(
    ...gameSlots.slots.map((s) => {
      const option = document.createElement("option");
      option.value = s.id;
      option.textContent = s.name;
      return option;
    }),
  );
  el("savedGames").value = gameSlots.activeId;
}
function createGame() {
  saveSlot();
  const id = gameSlots.nextId;
  const data = {
    format: "bird-life",
    version: 2,
    nextId: 2,
    selected: 1,
    actionCount: 0,
    flock: [makeBird(1, 0)],
  };
  const updated = {
    activeId: id,
    nextId: id + 1,
    slots: [...gameSlots.slots, { id, name: "ゲーム" + id, data }],
  };
  localStorage.setItem(SLOTS_KEY, JSON.stringify(updated));
  gameSlots = updated;
  importGameData(JSON.stringify(data));
  renderSlots();
  render("🪺 今までのゲームを保存して、新しいゲームを始めました。");
}
function switchGame(id) {
  const slot = gameSlots.slots.find((s) => s.id === id);
  if (!slot || id === gameSlots.activeId) return;
  saveSlot();
  const previous = gameSlots.activeId;
  gameSlots.activeId = id;
  try {
    importGameData(JSON.stringify(slot.data));
  } catch (e) {
    gameSlots.activeId = previous;
    renderSlots();
    throw e;
  }
  renderSlots();
  render("🪺 " + slot.name + "に切り替えました。");
}
function gameData() {
  return { format: "bird-life", version: 2, nextId, selected, actionCount, flock };
}
function importGameData(text) {
  const d = JSON.parse(text);
  if (!d || d.format !== "bird-life" || d.version !== 2 || !Array.isArray(d.flock) || !d.flock.length)
    throw new Error("Bird LifeのJSONファイルを選んでください。");
  const ids = new Set();
  const number = (v, min, max) => typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
  for (const b of d.flock) {
    if (
      !b ||
      !Number.isSafeInteger(b.id) ||
      b.id < 1 ||
      ids.has(b.id) ||
      !Number.isInteger(b.variant) ||
      !number(b.variant, 0, variants.length - 1) ||
      !number(b.age, 0, Number.MAX_SAFE_INTEGER) ||
      !number(b.warmth, 0, 3) ||
      ![b.food, b.happy, b.energy].every((v) => number(v, 0, 100)) ||
      !number(b.x, 0, 100) ||
      !number(b.y, 0, 100) ||
      typeof b.alive !== "boolean" ||
      typeof b.laid !== "boolean" ||
      (b.name !== null && (typeof b.name !== "string" || /[<>&"']/.test(b.name))) ||
      !b.genes ||
      ![b.genes.body, b.genes.belly, b.genes.accent].every(
        (v) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v),
      ) ||
      !PATTERNS.includes(b.genes.pattern) ||
      b.genesVersion !== 2 ||
      (b.collapsed !== undefined && typeof b.collapsed !== "boolean") ||
      (b.revive !== undefined && (!Number.isInteger(b.revive) || !number(b.revive, 0, 3)))
    )
      throw new Error("鳥のデータが正しくありません。");
    ids.add(b.id);
  }
  if (
    !Number.isSafeInteger(d.nextId) ||
    d.nextId <= Math.max(...ids) ||
    !ids.has(d.selected) ||
    !Number.isInteger(d.actionCount) ||
    !number(d.actionCount, 0, 2) ||
    d.flock.some((b) => b.parent !== null && !ids.has(b.parent))
  )
    throw new Error("ゲームデータが正しくありません。");
  // 全項目の検証が済むまで、現在のゲームと保存データには触れない。
  flock = d.flock.map((b) => ({ ...b, genes: { ...b.genes } }));
  nextId = d.nextId;
  selected = d.selected;
  actionCount = d.actionCount;
  noticeDismissedFor.clear();
  render("JSONファイルからゲームデータを復元しました。");
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
function load(slotText = null) {
  try {
    const raw = slotText || localStorage.getItem(SAVE_KEY) || localStorage.getItem("bird-life-save-v1");
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
    actionCount =
      Number.isInteger(d.actionCount) && d.actionCount >= 0 && d.actionCount < 3 ? d.actionCount : 0;
    return flock.length > 0;
  } catch (e) {
    return false;
  }
}
