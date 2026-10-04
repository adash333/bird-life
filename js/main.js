// ボタンの動作とゲームの開始。必ず最後に読み込む。
el("soundStart").onclick = startAudio;
el("exportData").onclick = () => {
  const blob = new Blob([JSON.stringify(gameData(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bird-life-" + new Date().toISOString().replace(/[:.]/g, "-") + ".json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  el("dataStatus").textContent = "ゲームデータをJSONでエクスポートしました。";
};
el("importData").onclick = () => el("importFile").click();
el("importFile").onchange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    importGameData(await file.text());
    el("dataStatus").textContent = "ゲームデータをインポートしました。";
  } catch (e) {
    el("dataStatus").textContent =
      "読み込めませんでした。正しいBird LifeのJSONファイルを選んでください。現在のデータはそのままです。";
  } finally {
    event.target.value = "";
  }
};
el("closeNotice").onclick = () => {
  const id = Number(el("hungerNotice").dataset.bird);
  if (id) noticeDismissedFor.add(id);
  el("hungerNotice").classList.add("hidden");
};
el("revive").onclick = () => {
  const b = current();
  if (!b || !b.collapsed) return;
  b.revive = (b.revive || 0) + 1;
  if (b.revive >= 3) {
    b.collapsed = false;
    b.revive = 0;
    for (const k of ["food", "happy", "energy"]) b[k] = Math.max(b[k], 40);
    noticeDismissedFor.delete(b.id);
    sound("hatch");
    setTimeout(() => sound("chirp"), 450);
    render("✨ " + (b.name || "鳥") + "ちゃんが目をさまして、元気に復活しました！");
  } else {
    sound("warm");
    render("🤲 やさしくなでました。あと " + (3 - b.revive) + " 回で起きそうです。");
  }
};
el("warm").onclick = () => {
  const b = current();
  if (stageOf(b)[0] !== "egg") return;
  b.warmth = (b.warmth || 0) + 1;
  if (b.warmth >= 3) {
    b.warmth = 3;
    b.age = 6;
    if (!b.name) b.name = uniqueName(b.id);
    sound("hatch");
    render("🐣 たまごがかえりました！ " + b.name + "ちゃんが世界に出てきました！");
  } else {
    sound("warm");
    render("🤲 卵をあたためました。あと " + (3 - b.warmth) + " 回です。");
  }
};
el("feed").onclick = () => {
  noticeDismissedFor.delete(current().id);
  sound("eat");
  change({ food: 25, happy: 3 }, "🍚 おいしそうに食べています。");
};
el("play").onclick = () => {
  sound("chirp");
  change({ happy: 24, energy: -10, food: -6 }, "🧸 楽しそうに遊んでいます！");
};
el("sleep").onclick = () => {
  sound("sleep");
  change({ energy: 30, food: -8 }, "💤 すやすや眠っています。");
};
el("advance").onclick = () => {
  const b = current();
  if (stageOf(b)[0] === "egg") return;
  sound("walk");
  actionCount = 0;
  render("⏩ " + (passTime(b) || "3時間たちました。"));
};
let restored = load();
if (!flock.length) {
  flock = [makeBird(1, 0)];
  nextId = 2;
  selected = 1;
  restored = false;
}
ensurePlayable();
if (!current().name && current().warmth >= 3) current().name = uniqueName(current().id);
render(restored ? "おかえりなさい。鳥たちは世界で暮らしています。" : "最初の卵が世界にやってきました。");
moveTimer = setInterval(wander, 2600);
addEventListener("resize", layoutField);
