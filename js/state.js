// ゲーム全体で共有する状態と、小さな便利関数。
const variants = [
    { adult: "🐦", type: "青い鳥", trait: "青色・ほっぺ模様" },
    { adult: "🐤", type: "黄色い鳥", trait: "黄色・しま模様" },
    { adult: "🦜", type: "緑の鳥", trait: "緑色・カラフル" },
    { adult: "🕊️", type: "白い鳥", trait: "白色・ふわふわ" },
    { adult: "🐧", type: "白黒の鳥", trait: "白黒・おなか模様" },
  ],
  SAVE_KEY = "bird-life-save-v2";
let nextId = 2,
  selected = 1,
  flock = [],
  audioCtx = null,
  soundReady = false,
  moveTimer = null,
  actionCount = 0,
  noticeDismissedFor = new Set();
const el = (id) => document.getElementById(id),
  clamp = (v) => Math.max(0, Math.min(100, v)),
  current = () => flock.find((b) => b.id === selected);
