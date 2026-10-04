// Plays the game in a real browser, the way a person would, and fails on any error.
// Each test starts from an empty save (Playwright gives every test a fresh browser context).
const { test, expect } = require("@playwright/test");
const path = require("path");
const { pathToFileURL } = require("url");

const GAME_URL = pathToFileURL(path.join(__dirname, "..", "index.html")).href;
const SAVE_KEY = "bird-life-save-v2";

let errors;

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
});

test.afterEach(() => {
  expect(errors, "JavaScript errors on the page").toEqual([]);
});

async function openGame(page) {
  await page.goto(GAME_URL);
  await expect(page.locator("#bootStatus")).toHaveText("");
}

async function hatch(page) {
  for (let i = 0; i < 3; i++) await page.click("#warm");
  await expect(page.locator("#msg")).toContainText("たまごがかえりました");
}

/** Every bird/egg in the world must be on screen and not hidden behind a panel. */
async function expectBirdsVisible(page) {
  const birds = page.locator(".worldBird");
  await expect(birds.first()).toBeVisible();
  const covered = await page.evaluate(() => {
    const panels = [...document.querySelectorAll(".panel")]
      .filter((p) => p.offsetParent)
      .map((p) => p.getBoundingClientRect());
    return [...document.querySelectorAll(".worldBird")]
      .map((n) => {
        const r = n.getBoundingClientRect();
        const cx = r.x + r.width / 2;
        const cy = r.y + r.height / 2;
        const off = cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight;
        const under = panels.some((p) => cx > p.left && cx < p.right && cy > p.top && cy < p.bottom);
        return off || under ? n.dataset.id : null;
      })
      .filter(Boolean);
  });
  expect(covered, "birds hidden behind a panel or off screen").toEqual([]);
}

/** Wait for any wandering move to finish so the bird can be clicked reliably. */
async function selectBird(page, id) {
  await page.evaluate((id) => {
    selected = id;
    render();
  }, id);
}

test("starts with an egg that is visible in the world", async ({ page }) => {
  await openGame(page);
  await expect(page.locator("#name")).toHaveText("まだ名前のない卵");
  await expect(page.locator("#warm")).toBeVisible();
  await expect(page.locator(".worldBird .stageTag")).toHaveText("卵");
  await expectBirdsVisible(page);
});

test("warming the egg three times hatches a chick", async ({ page }) => {
  await openGame(page);
  await page.click("#warm");
  await expect(page.locator("#warmText")).toHaveText("1 / 3 回 あたためました");
  await page.click("#warm");
  await page.click("#warm");
  await expect(page.locator("#name")).toHaveText(/ちゃん$/);
  await expect(page.locator(".worldBird .stageTag")).toHaveText("ヒナ");
  for (const id of ["#feed", "#play", "#sleep", "#advance"]) await expect(page.locator(id)).toBeVisible();
  await expectBirdsVisible(page);
});

test("care buttons change the status bars", async ({ page }) => {
  await openGame(page);
  await hatch(page);
  const food = page.locator(".stat").nth(0).locator("strong");
  await expect(food).toHaveText("75");
  await page.click("#feed");
  await expect(food).toHaveText("100");
  await expect(page.locator("#msg")).toContainText("あと2回のお世話で時間が進みます");
});

test("three care actions advance time by 3 hours", async ({ page }) => {
  await openGame(page);
  await hatch(page);
  await expect(page.locator("#stage")).toContainText("生後 6時間");
  await page.click("#feed");
  await page.click("#play");
  await page.click("#sleep");
  await expect(page.locator("#stage")).toContainText("生後 9時間");
  await expect(page.locator("#msg")).toContainText("3時間たちました");
});

test("the bird grows chick → young → adult with different pictures", async ({ page }) => {
  await openGame(page);
  await hatch(page);
  const tag = page.locator(`.worldBird[data-id="1"] .stageTag`);
  const art = () => page.locator(`.worldBird[data-id="1"] svg`).innerHTML();
  const chickArt = await art();
  await expect(tag).toHaveText("ヒナ");
  for (let i = 0; i < 4; i++) {
    await page.click("#feed");
    await page.click("#advance");
  }
  await expect(tag).toHaveText("若鳥");
  const youngArt = await art();
  for (let i = 0; i < 6; i++) {
    await page.click("#feed");
    await page.click("#sleep");
    await page.click("#advance");
  }
  await selectBird(page, 1);
  await expect(tag).toHaveText("成鳥");
  const adultArt = await art();
  expect(new Set([chickArt, youngArt, adultArt]).size).toBe(3);
});

test("a healthy adult lays an egg and the family grows", async ({ page }) => {
  await openGame(page);
  await hatch(page);
  await page.evaluate(() => {
    const b = current();
    b.age = 36;
    b.food = b.happy = b.energy = 90;
    render();
  });
  await page.click("#advance");
  await expect(page.locator("#msg")).toContainText("卵を産みました");
  await expect(page.locator("#count")).toHaveText("2羽");
  await expect(page.locator("#name")).toHaveText("まだ名前のない卵");
  await expectBirdsVisible(page);
});

test("a bird whose status hits 0 falls asleep and revives after 3 pats", async ({ page }) => {
  await openGame(page);
  await hatch(page);
  await page.evaluate(() => {
    current().energy = 5;
    render();
  });
  await page.click("#play");
  await expect(page.locator("#msg")).toContainText("その場で寝てしまいました");
  await expect(page.locator("#revive")).toBeVisible();
  await expect(page.locator("#feed")).toBeHidden();
  await expect(page.locator(".worldBird.asleep .stageTag")).toHaveText("ねむってる");

  // Time does not hurt a sleeping bird, and it never dies.
  const alive = await page.evaluate(() => current().alive && current().collapsed);
  expect(alive).toBe(true);

  await page.click("#revive");
  await page.click("#revive");
  await expect(page.locator("#reviveText")).toContainText("2 / 3");
  await page.click("#revive");
  await expect(page.locator("#msg")).toContainText("復活しました");
  await expect(page.locator("#feed")).toBeVisible();
  const energy = await page.evaluate(() => current().energy);
  expect(energy).toBeGreaterThanOrEqual(40);
});

test("a bird also falls asleep (not dies) when time passes", async ({ page }) => {
  await openGame(page);
  await hatch(page);
  await page.evaluate(() => {
    current().food = 5;
    render();
  });
  await page.click("#advance");
  await expect(page.locator("#msg")).toContainText("その場で寝てしまいました");
  await expect(page.locator("#count")).toHaveText("1羽");
  await expect(page.locator("#revive")).toBeVisible();
});

test("hunger notice slides in and stays until closed", async ({ page }) => {
  await openGame(page);
  await hatch(page);
  await page.evaluate(() => {
    current().food = 30;
    render();
  });
  await expect(page.locator("#hungerNotice")).toBeVisible();
  await page.click("#play");
  await expect(page.locator("#hungerNotice")).toBeVisible();
  await page.click("#closeNotice");
  await expect(page.locator("#hungerNotice")).toBeHidden();
});

test("progress is saved and restored after reload", async ({ page }) => {
  await openGame(page);
  await hatch(page);
  const name = await page.locator("#name").textContent();
  await page.click("#feed");
  await page.reload();
  await expect(page.locator("#name")).toHaveText(name);
  await expect(page.locator("#msg")).toContainText("おかえりなさい");
  await expectBirdsVisible(page);
});

for (const [label, save] of [
  ["broken JSON", "{not json"],
  ["empty flock", JSON.stringify({ flock: [] })],
  [
    "only dead birds",
    JSON.stringify({ nextId: 3, selected: 1, flock: [{ id: 1, alive: false, warmth: 3, age: 40 }] }),
  ],
  [
    "strange values",
    JSON.stringify({ selected: 99, flock: [{ id: "x", food: "lots", x: 999, y: -5 }, null, 7] }),
  ],
]) {
  test(`a ${label} save never stops the game`, async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => {
        if (!sessionStorage.getItem("seeded")) {
          localStorage.setItem(key, value);
          sessionStorage.setItem("seeded", "1");
        }
      },
      [SAVE_KEY, save],
    );
    await openGame(page);
    await expect(page.locator(".worldBird").first()).toBeVisible();
    const playable = page.locator("#warm, #feed, #revive").filter({ visible: true });
    await expect(playable.first()).toBeVisible();
  });
}

test("sound button never throws", async ({ page }) => {
  await openGame(page);
  await page.click("#soundStart");
  await expect(page.locator("#soundStart")).toHaveText(/音/);
});
