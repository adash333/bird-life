// 効果音（Web Audio API。音声ファイルは使わない）。
async function startAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error("no audio");
    audioCtx = audioCtx || new AC();
    await audioCtx.resume();
    soundReady = audioCtx.state === "running";
    if (!soundReady) throw new Error("not running");
    el("soundStart").textContent = "🔊 音 ON";
    tone(880, 0.18, "square", 0.18);
    tone(1320, 0.18, "triangle", 0.18, 0.2);
    setTimeout(() => sound("chirp"), 430);
  } catch (e) {
    soundReady = false;
    el("soundStart").textContent = "🔇 音を再試行";
  }
}
function tone(f, d = 0.08, type = "sine", v = 0.12, delay = 0) {
  if (!soundReady || !audioCtx) return;
  const o = audioCtx.createOscillator(),
    g = audioCtx.createGain(),
    t = audioCtx.currentTime + delay;
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + d);
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start(t);
  o.stop(t + d);
}
function noise(d = 0.06, v = 0.09, delay = 0) {
  if (!soundReady || !audioCtx) return;
  const n = Math.floor(audioCtx.sampleRate * d),
    b = audioCtx.createBuffer(1, n, audioCtx.sampleRate),
    a = b.getChannelData(0);
  for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = audioCtx.createBufferSource(),
    g = audioCtx.createGain();
  s.buffer = b;
  g.gain.value = v;
  s.connect(g);
  g.connect(audioCtx.destination);
  s.start(audioCtx.currentTime + delay);
}
function sound(k) {
  if (k === "chirp") {
    tone(1300, 0.09, "sine", 0.14);
    tone(1850, 0.1, "sine", 0.12, 0.1);
    tone(1550, 0.08, "sine", 0.1, 0.21);
  }
  if (k === "eat") {
    noise(0.06, 0.13);
    noise(0.05, 0.12, 0.09);
    noise(0.06, 0.12, 0.18);
    tone(480, 0.07, "triangle", 0.08, 0.26);
  }
  if (k === "walk") {
    tone(150, 0.05, "sine", 0.1);
    tone(210, 0.05, "sine", 0.09, 0.12);
  }
  if (k === "hatch") {
    noise(0.14, 0.12);
    tone(700, 0.12, "triangle", 0.12, 0.1);
    tone(1200, 0.15, "sine", 0.14, 0.25);
  }
  if (k === "egg") {
    tone(600, 0.12, "sine", 0.1);
    tone(950, 0.15, "sine", 0.12, 0.14);
  }
  if (k === "sleep") {
    tone(300, 0.18, "sine", 0.07);
    tone(230, 0.22, "sine", 0.06, 0.18);
  }
  if (k === "warm") {
    tone(500, 0.1, "sine", 0.08);
    tone(700, 0.1, "sine", 0.07, 0.1);
  }
}
