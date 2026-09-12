// Dumps the rendered text + normalised DOM of every route so a refactor can be
// proven content-identical:  node scripts/snapshot.mjs <baseUrl> <out.json>
// then diff two output files.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const BASE = (process.argv[2] || "http://localhost:8888").replace(/\/$/, "");
const OUT = process.argv[3] || "snapshot.json";
const ROUTES = ["/", "/photography", "/resume", "/certificate/google-cloud-engineer", "/certificate/jp-morgan-forage-internship", "/cert/think-tank", "/certificate/bogus"];

const browser = await chromium.launch();
const out = {};
for (const route of ROUTES) {
  for (const [label, w, h] of [["desktop", 1280, 800], ["phone", 390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500); // let TypeAnimation finish
    const snap = await page.evaluate(() => {
      const root = document.querySelector("#content").cloneNode(true);
      root.querySelectorAll("canvas").forEach((c) => c.replaceWith(document.createElement("canvas")));
      // Strip per-render noise: transition delays, inline transform styles, MUI ids
      root.querySelectorAll("[style]").forEach((e) => e.removeAttribute("style"));
      root.querySelectorAll("[id^='mui-'],[aria-labelledby^='mui-'],[aria-controls^='mui-']").forEach((e) => { e.removeAttribute("id"); e.removeAttribute("aria-labelledby"); e.removeAttribute("aria-controls"); });
      root.querySelectorAll(".fade-in-section").forEach((e) => e.classList.add("is-visible"));
      return { text: document.body.innerText.replace(/\s+/g, " ").trim(), html: root.innerHTML.replace(/\s+/g, " ") , title: document.title };
    });
    out[`${route} [${label}]`] = snap;
    await ctx.close();
  }
}
await browser.close();
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(`wrote ${OUT} (${Object.keys(out).length} snapshots)`);
