// Fails if any game JavaScript has a syntax error or index.html points at a missing file.
// Run with: npm run check
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";

let failed = false;
const fail = (msg) => {
  console.error("✗ " + msg);
  failed = true;
};

function checkJs(label, file) {
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
    console.log("✓ " + label);
  } catch (e) {
    fail(label + "\n" + e.stderr.toString());
  }
}

const html = readFileSync("index.html", "utf8");

// External scripts and stylesheets referenced by index.html must exist.
for (const [, src] of html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)) {
  if (!existsSync(src.split("?")[0])) fail("index.html references missing script: " + src);
}
for (const [, href] of html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)) {
  if (!existsSync(href.split("?")[0])) fail("index.html references missing stylesheet: " + href);
}

// Inline scripts inside index.html.
const tmp = mkdtempSync(join(tmpdir(), "bird-life-"));
[...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)].forEach(([, code], i) => {
  const f = join(tmp, "inline-" + i + ".js");
  writeFileSync(f, code);
  checkJs("index.html inline script #" + (i + 1), f);
});

// Every file in js/.
if (existsSync("js")) {
  for (const f of readdirSync("js").filter((f) => f.endsWith(".js"))) checkJs("js/" + f, join("js", f));
}

if (failed) process.exit(1);
