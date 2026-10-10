// ゲームのルール：お世話、時間経過、寝てしまう・復活、産卵。
function ensurePlayable() {
  let live = flock.find((b) => b.alive);
  if (!live) {
    const id = Math.max(0, ...flock.map((b) => b.id)) + 1;
    const egg = makeBird(id, id % variants.length);
    egg.warmth = 0;
    egg.age = 0;
    egg.name = null;
    egg.x = 50;
    egg.y = 50;
    egg.genes = {
      body: COLORS[(id - 1) % COLORS.length],
      belly: BELLY[(id * 2) % BELLY.length],
      pattern: PATTERNS[(id - 1) % PATTERNS.length],
      accent: COLORS[(id + 4) % COLORS.length],
    };
    egg.genesVersion = 2;
    flock.push(egg);
    nextId = Math.max(nextId, id + 1);
    live = egg;
  }
  if (!flock.some((b) => b.id === selected && b.alive)) selected = live.id;
  return live;
}
function collapse(b) {
  b.collapsed = true;
  b.revive = 0;
  sound("sleep");
  return (
    " 💤 " + (b.name || "鳥") + "ちゃんはつかれて、その場で寝てしまいました。なでて起こしてあげましょう。"
  );
}
function passTime(b) {
  if (!b || !b.alive || b.collapsed || stageOf(b)[0] === "egg") return null;
  b.age += 3;
  b.food = clamp(b.food - 10);
  b.happy = clamp(b.happy - 6);
  b.energy = clamp(b.energy - 7);
  if (b.food <= 0 || b.happy <= 0 || b.energy <= 0) return collapse(b);
  if (b.alive && stageOf(b)[0] === "adult" && b.food >= 55 && b.happy >= 55 && b.energy >= 55) {
    const child = layEgg(b);
    sound("egg");
    selected = child.id;
    return " 🥚 そして卵を産みました！";
  }
  return " ⏰ お世話をしているうちに3時間たちました。";
}
function countAction(msg) {
  actionCount++;
  if (actionCount >= 3) {
    actionCount = 0;
    const extra = passTime(current());
    return msg + (extra || "");
  }
  return msg + "（あと" + (3 - actionCount) + "回のお世話で時間が進みます）";
}
function change(vals, msg) {
  const b = current();
  if (!b.alive || b.collapsed || stageOf(b)[0] === "egg") return;
  Object.entries(vals).forEach(([k, v]) => (b[k] = clamp(b[k] + v)));
  if (b.food <= 0 || b.happy <= 0 || b.energy <= 0) {
    actionCount = 0;
    render(msg + collapse(b));
    return;
  }
  render(countAction(msg));
}
function chooseChildVariant(p) {
  if (Math.random() < 0.55) return p.variant;
  let n;
  do {
    n = Math.floor(Math.random() * variants.length);
  } while (n === p.variant);
  return n;
}
function layEgg(p) {
  p.laid = true;
  const c = makeBird(nextId++, chooseChildVariant(p), p.id);
  c.name = uniqueName(c.id);
  c.x = p.x + Math.random() * 8 - 4;
  c.y = p.y;
  flock.push(c);
  return c;
}
