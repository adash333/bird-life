// 鳥の個体データ：色・模様の遺伝、名前、成長段階。
const COLORS = [
  "#55aee6",
  "#ffd34e",
  "#75c96b",
  "#f38aaa",
  "#a98ce3",
  "#f39b4a",
  "#64c9c1",
  "#e86f6f",
  "#8c6b4f",
  "#f4f1e8",
];
const BELLY = ["#fff4cf", "#ffffff", "#dff6ff", "#ffe0ec", "#e7ffd9", "#f5ddff"];
const PATTERNS = ["none", "stripes", "spots", "cheeks", "bib"];
function genesFor(id, parent = null) {
  const p = parent && parent.genes;
  if (p && Math.random() < 0.65)
    return {
      body: Math.random() < 0.7 ? p.body : COLORS[id % COLORS.length],
      belly: Math.random() < 0.7 ? p.belly : BELLY[id % BELLY.length],
      pattern: Math.random() < 0.65 ? p.pattern : PATTERNS[id % PATTERNS.length],
      accent: COLORS[(id + 3) % COLORS.length],
    };
  return {
    body: COLORS[(id * 3) % COLORS.length],
    belly: BELLY[(id * 2) % BELLY.length],
    pattern: PATTERNS[id % PATTERNS.length],
    accent: COLORS[(id * 5 + 2) % COLORS.length],
  };
}
const NAMES = [
  "そら",
  "レモン",
  "ミント",
  "モモ",
  "ルル",
  "ココ",
  "ピノ",
  "ハナ",
  "チロ",
  "ポポ",
  "リン",
  "ナナ",
  "キキ",
  "マロン",
  "ユズ",
  "ラテ",
  "ノア",
  "ベル",
  "ミミ",
  "フク",
  "サクラ",
  "ツキ",
  "ホシ",
  "ニコ",
  "クルミ",
  "アオ",
  "シロップ",
  "ラムネ",
  "プラム",
  "メイ",
];
function uniqueName(id) {
  const used = new Set(
    flock
      ?.filter((b) => b.id !== id)
      .map((b) => b.name)
      .filter(Boolean) || [],
  );
  for (let i = 0; i < NAMES.length; i++) {
    const n = NAMES[(id - 1 + i) % NAMES.length];
    if (!used.has(n)) return n;
  }
  return "とり" + id;
}
function makeBird(id, variant, parent = null) {
  const p = flock.find((x) => x.id === parent) || null;
  return {
    id,
    variant,
    parent,
    name: null,
    genes: { ...genesFor(id, p), body: COLORS[(id - 1) % COLORS.length] },
    genesVersion: 2,
    age: 0,
    warmth: 0,
    food: 75,
    happy: 75,
    energy: 75,
    alive: true,
    laid: false,
    x: 25 + Math.random() * 50,
    y: 40 + Math.random() * 30,
  };
}
function stageOf(b) {
  if ((b.warmth || 0) < 3) return ["egg", "🥚", "卵"];
  if (b.age < 12) return ["chick", "🐣", "ヒナ"];
  if (b.age < 15) return ["young", "🐤", "若鳥"];
  return ["adult", variants[b.variant].adult, "成鳥"];
}
