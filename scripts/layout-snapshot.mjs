// Records bounding boxes of layout-defining elements on every route so a
// markup/CSS refactor can be proven layout-neutral:
//   node scripts/layout-snapshot.mjs <baseUrl> <out.json>
//   node scripts/layout-snapshot.mjs --diff a.json b.json   (tolerance 1px)
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const SELECTORS = [
  ".navbar", "#intro", ".intro-title", ".intro-desc", ".intro-actions", ".intro-contact",
  ".section-header", ".section-title", "#about", ".about-description", ".about-image img", ".tech-stack li",
  "#experience", ".joblist-job-title", ".joblist-job-company", ".joblist-duration", ".job-description li",
  "#projects", ".projects-card", ".card-title", ".card-desc", ".cert-block", ".cert-pill",
  "#education", ".education-row", ".education-school", "#photography", ".photography-card", ".photography-image",
  "#credits", ".ending-credits", ".gallery-card", ".gallery-image", ".cert-page-head", ".cert-page-title", ".cert-page-frame-wrap",
  ".cert-page-other-pill", ".back-button", ".explore-link", ".game-toggle-fixed", ".back-to-top", "[data-view-toggle]",
];
const ROUTES = ["/", "/photography", "/resume", "/certificate/think-tank"];

if (process.argv[2] === "--diff") {
  const a = JSON.parse(readFileSync(process.argv[3], "utf8"));
  const b = JSON.parse(readFileSync(process.argv[4], "utf8"));
  let diffs = 0;
  for (const key of Object.keys(a)) {
    const ra = a[key], rb = b[key] || [];
    if (ra.length !== rb.length) { diffs++; console.log(`DIFF ${key}: ${ra.length} → ${rb.length} elements`); continue; }
    ra.forEach((x, i) => {
      const y = rb[i];
      const off = ["x", "y", "w", "h"].filter((k) => Math.abs(x[k] - y[k]) > 1);
      if (off.length) { diffs++; console.log(`DIFF ${key} [${i}] ${x.sel}: ${JSON.stringify(x)} → ${JSON.stringify(y)}`); }
    });
  }
  console.log(diffs ? `${diffs} layout differences` : `LAYOUT IDENTICAL (${Object.keys(a).length} route/viewport snapshots, ±1px)`);
  process.exit(diffs ? 1 : 0);
}

const BASE = (process.argv[2] || "http://localhost:8888").replace(/\/$/, "");
const OUT = process.argv[3] || "layout.json";
const browser = await chromium.launch();
const out = {};
for (const route of ROUTES) {
  for (const [label, w, h] of [["desktop", 1280, 800], ["tablet", 768, 1024], ["phone", 390, 844], ["narrow", 320, 640]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    // reveal fade-in sections so boxes are measured in their final position
    await page.evaluate(() => document.querySelectorAll(".fade-in-section").forEach((e) => e.classList.add("is-visible")));
    await page.waitForTimeout(300);
    out[`${route} [${label}]`] = await page.evaluate((sels) => {
      const rows = [];
      for (const sel of sels) {
        document.querySelectorAll(sel).forEach((el) => {
          const r = el.getBoundingClientRect();
          rows.push({ sel, tag: el.tagName.toLowerCase(), x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height), fs: getComputedStyle(el).fontSize, fw: getComputedStyle(el).fontWeight });
        });
      }
      rows.push({ sel: "document", tag: "html", x: 0, y: 0, w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight });
      return rows;
    }, SELECTORS);
    await ctx.close();
  }
}
await browser.close();
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(`wrote ${OUT} (${Object.keys(out).length} snapshots)`);
