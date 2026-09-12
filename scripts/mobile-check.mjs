// Mobile/responsive sweep: node scripts/mobile-check.mjs [baseUrl]
// For 320/375/390/412/768/1024/1280 px: no horizontal scroll on any route,
// Human/Agent pill inside the viewport and clear of Back-to-top, and every
// visible interactive element at least 44x44 CSS px (reports smaller ones).
import { chromium } from "playwright";

const BASE = (process.argv[2] || "http://localhost:8888").replace(/\/$/, "");
const WIDTHS = [320, 375, 390, 412, 768, 1024, 1280];
const ROUTES = ["/", "/photography", "/resume", "/certificate/think-tank", "/?view=agent"];
const results = [];
const check = (id, ok, d = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${id}${d ? "  — " + d : ""}`); };

const browser = await chromium.launch();
const small = new Map();
for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 700 ? 800 : 900 }, hasTouch: w < 700 });
  const page = await ctx.newPage();
  for (const r of ROUTES) {
    await page.goto(BASE + r, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const d = await page.evaluate(() => {
      const vis = (el) => { const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && b.width > 0 && b.height > 0; };
      const pill = document.querySelector("[data-view-toggle]"); const btt = document.querySelector(".back-to-top");
      const pb = pill ? pill.getBoundingClientRect() : null; const bb = btt ? btt.getBoundingClientRect() : null;
      const small = [];
      document.querySelectorAll("a[href], button, [role=button], [role=radio], [role=tab], input, select, textarea").forEach((el) => {
        if (!vis(el)) return; const b = el.getBoundingClientRect();
        if (b.width < 44 || b.height < 44) small.push(`${el.tagName.toLowerCase()}${el.className ? "." + [...el.classList].slice(0, 2).join(".") : ""} ${Math.round(b.width)}x${Math.round(b.height)}`);
      });
      return {
        scrollW: document.documentElement.scrollWidth, innerW: innerWidth,
        pill: pb && { x: pb.x, r: pb.x + pb.width, y: pb.y, b: pb.y + pb.height },
        overlap: pb && bb && btt.classList.contains("back-to-top--visible") && pb.x < bb.x + bb.width && pb.x + pb.width > bb.x && pb.y < bb.y + bb.height && pb.y + pb.height > bb.y,
        small,
      };
    });
    check(`${w}px ${r}: no horizontal scroll`, d.scrollW <= d.innerW, `${d.scrollW}/${d.innerW}`);
    if (d.pill) {
      check(`${w}px ${r}: pill inside viewport`, d.pill.x >= 0 && d.pill.r <= w && d.pill.b <= (w < 700 ? 800 : 900), JSON.stringify(d.pill));
      check(`${w}px ${r}: pill clear of back-to-top`, !d.overlap);
    }
    for (const s of d.small) { const k = s.replace(/ \d+x\d+$/, ""); if (!small.has(k)) small.set(k, new Set()); small.get(k).add(`${w}px:${s.match(/\d+x\d+$/)[0]}`); }
  }
  await ctx.close();
}
await browser.close();
console.log("\nInteractive elements smaller than 44x44 (element → widths:size):");
for (const [k, v] of [...small.entries()].sort()) console.log(`  ${k.padEnd(48)} ${[...v].slice(0, 4).join("  ")}${v.size > 4 ? "  …" : ""}`);
console.log(`\n${results.filter(Boolean).length}/${results.length} checks passed`);
process.exit(results.every(Boolean) ? 0 : 1);
