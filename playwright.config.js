// Automated play-through tests. Run with: npm test
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests",
  timeout: 60_000,
  reporter: [["list"]],
  projects: [
    { name: "phone", use: { ...devices["iPhone 13"], browserName: "chromium" } },
    { name: "desktop", use: { browserName: "chromium", viewport: { width: 1280, height: 720 } } },
  ],
});
