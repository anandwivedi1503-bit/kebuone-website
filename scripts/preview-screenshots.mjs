import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";

const outDir = "/opt/cursor/artifacts/screenshots";
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(2000);

const shots = [
  { name: "hero-gps", selector: "#home" },
  { name: "advantage", selector: "text=EVUDDY advantage" },
  { name: "network", selector: "text=LIVE CITIES FROM OPS" },
  { name: "join-steps", selector: "text=Ride in three steps" },
  { name: "fleet-poster", selector: "text=Fleet partner investment" },
];

for (const { name, selector } of shots) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${outDir}/premium-preview-${name}.png` });
}

const mobile = await browser.newPage({ ...devices["iPhone 13"] });
await mobile.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 120000 });
await mobile.waitForTimeout(1500);
await mobile.locator("text=Fleet partner investment").first().scrollIntoViewIfNeeded();
await mobile.waitForTimeout(400);
await mobile.screenshot({ path: `${outDir}/premium-preview-fleet-mobile.png`, fullPage: false });

await browser.close();
console.log("Saved to", outDir);
