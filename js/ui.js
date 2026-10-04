// 画面の表示：世界・鳥・パネル・家族一覧・空腹通知・歩き回り。
function layoutField() {
  const w = el("world"),
    f = el("field"),
    W = w.clientWidth,
    H = w.clientHeight,
    care = document.querySelector(".panel.care").getBoundingClientRect(),
    fam = document.querySelector(".panel.familyPanel"),
    famR = fam.offsetParent ? fam.getBoundingClientRect() : null;
  let horizon,
    left = 0,
    right = 0,
    bottom = 0;
  if (innerWidth >= 900) {
    horizon = Math.round(H * 0.5);
    left = care.right + 12;
    right = famR ? W - famR.left + 12 : 0;
    bottom = 12;
  } else {
    bottom = H - care.top + 6;
    horizon = Math.max(110, Math.min(Math.round(H * 0.54), H - bottom - Math.max(150, H * 0.22)));
  }
  w.style.setProperty("--horizon", horizon + "px");
  Object.assign(f.style, {
    top: horizon + "px",
    left: left + "px",
    right: right + "px",
    bottom: bottom + "px",
  });
}
function renderWorld() {
  document.querySelectorAll(".worldBird").forEach((n) => n.remove());
  for (const b of flock.filter((x) => x.alive)) {
    const s = stageOf(b),
      n = document.createElement("div");
    n.className = "worldBird" + (b.id === selected ? " selected" : "");
    n.dataset.id = b.id;
    n.classList.add("st-" + s[0]);
    if (b.collapsed) n.classList.add("asleep");
    try {
      n.innerHTML =
        (b.collapsed ? sleepyEyes(birdSvg(b)) : birdSvg(b)) +
        (b.collapsed ? '<span class="zzz">💤</span>' : "") +
        '<span class="stageTag">' +
        (b.collapsed ? "ねむってる" : s[2]) +
        "</span>";
    } catch (e) {
      n.textContent = "🐦";
    }
    n.style.left = b.x + "%";
    n.style.top = b.y + "%";
    n.onclick = () => {
      selected = b.id;
      sound("chirp");
      render();
    };
    el("field").appendChild(n);
  }
}
function checkHungerNotice() {
  const hungry = flock.find(
    (b) =>
      b.alive && !b.collapsed && stageOf(b)[0] !== "egg" && b.food <= 35 && !noticeDismissedFor.has(b.id),
  );
  if (hungry) {
    el("noticeText").textContent =
      (hungry.name || "鳥") +
      "ちゃんのおなかが " +
      Math.round(hungry.food) +
      " です。ごはんをあげてください。";
    el("hungerNotice").dataset.bird = hungry.id;
    el("hungerNotice").classList.remove("hidden");
  } else el("hungerNotice").classList.add("hidden");
}
function render(message) {
  ensurePlayable();
  el("bootStatus").textContent = "";
  let b = current();
  if (!b || !b.alive) {
    b = flock.find((x) => x.alive);
    selected = b.id;
  }
  if (!b) {
    b = flock.find((x) => x.alive) || flock[0];
    if (!b) {
      flock = [makeBird(1, 0)];
      b = flock[0];
    }
    selected = b.id;
  }
  const v = variants[b.variant] || variants[0],
    s = stageOf(b),
    egg = s[0] === "egg";
  el("count").textContent = flock.filter((x) => x.alive).length + "羽";
  if (!b.name && !egg) b.name = uniqueName(b.id);
  el("name").textContent = egg ? "まだ名前のない卵" : b.name + "ちゃん";
  el("trait").textContent = egg
    ? "どんな鳥が生まれるかな？"
    : "模様：" +
      ({ none: "無地", stripes: "しま模様", spots: "水玉模様", cheeks: "ほっぺ模様", bib: "おなか模様" }[
        b.genes?.pattern
      ] || "無地");
  el("stage").textContent = s[2] + (egg ? "" : "・生後 " + b.age + "時間");
  el("msg").textContent =
    message ||
    (!b.alive
      ? "この鳥は思い出として残っています。"
      : b.collapsed
        ? "つかれて寝てしまいました。3回なでると起きます。"
        : egg
          ? "世界の中の卵をあたためましょう。"
          : s[0] === "adult" && !b.laid
            ? "元気に育てると卵を産みます。"
            : "世界の中を自由に歩いています。");
  el("eggPanel").classList.toggle("hidden", !egg || !b.alive);
  el("stats").classList.toggle("hidden", egg);
  const down = !egg && !!b.collapsed;
  el("actions").classList.toggle("hidden", egg || down);
  el("revivePanel").classList.toggle("hidden", !down || !b.alive);
  if (down)
    el("reviveText").textContent = "💤 ぐっすり寝ています（" + (b.revive || 0) + " / 3 回 なでました）";
  if (egg) el("warmText").textContent = (b.warmth || 0) + " / 3 回 あたためました";
  else
    el("stats").innerHTML = [
      ["food", "🍚 おなか"],
      ["happy", "❤️ ごきげん"],
      ["energy", "⚡ げんき"],
    ]
      .map(
        ([k, l]) =>
          '<div class="stat"><div class="statLabel"><span>' +
          l +
          "</span><strong>" +
          Math.round(b[k]) +
          '</strong></div><div class="statBar"><div class="statFill" style="width:' +
          clamp(b[k]) +
          '%"></div></div></div>',
      )
      .join("");
  renderFamily();
  layoutField();
  renderWorld();
  checkHungerNotice();
  save();
}
function renderFamily() {
  el("family").innerHTML = "";
  for (const b of flock) {
    const s = stageOf(b),
      v = variants[b.variant],
      btn = document.createElement("button");
    btn.className = b.id === selected ? "active" : "";
    btn.innerHTML =
      (b.alive ? birdSvg(b, true) : "🪶") + "<br>" + (s[0] === "egg" ? "卵" : b.name || uniqueName(b.id));
    btn.onclick = () => {
      selected = b.id;
      render();
    };
    el("family").appendChild(btn);
  }
}
function wander() {
  for (const b of flock.filter((x) => x.alive && !x.collapsed && stageOf(x)[0] !== "egg")) {
    b.x = clamp((b.x || 50) + (Math.random() * 28 - 14));
    b.x = Math.max(12, Math.min(88, b.x));
    b.y = Math.max(25, Math.min(85, (b.y || 55) + (Math.random() * 16 - 8)));
    const n = document.querySelector('.worldBird[data-id="' + b.id + '"]');
    if (n) {
      n.classList.add("walking");
      n.style.left = b.x + "%";
      n.style.top = b.y + "%";
      setTimeout(() => n.classList.remove("walking"), 1500);
    }
  }
  save();
}
