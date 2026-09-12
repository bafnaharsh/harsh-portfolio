// Local regression check: every route on hard refresh + the game-mode checklist.
//
//   node scripts/verify.mjs [baseUrl]      (default http://localhost:8888)
//
// Prints one PASS/FAIL line per step and exits non-zero on any failure.
// Requires the site to already be running at baseUrl (e.g. `netlify serve`).
import { chromium } from "playwright";

const BASE = (process.argv[2] || "http://localhost:8888").replace(/\/$/, "");
const results = [];
const check = (id, ok, detail = "") => {
  results.push({ id, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${id}${detail ? "  — " + detail : ""}`);
};

const ROUTES = [
  ["/", (d) => d.text.includes("hi, harsh") && d.navbar],
  ["/photography", (d) => d.text.includes("/ photography") && d.navbar],
  ["/resume", (d) => d.h1.includes("Resume")],
  ["/certificate/google-cloud-engineer", (d) => d.h1.includes("Associate Cloud Engineer")],
  ["/certificate/google-ml-engineer", (d) => d.h1.includes("Professional ML Engineer")],
  ["/certificate/jp-morgan-forage-internship", (d) => d.h1.includes("JP Morgan Forage Internship")],
  ["/certificate/one-for-all", (d) => d.h1.includes("One for All")],
  ["/certificate/think-tank", (d) => d.h1.includes("Think Tank")],
  ["/certificate/consider-it-done", (d) => d.h1.includes("Consider It Done")],
  ["/cert/think-tank", (d) => d.h1.includes("Think Tank")],
  ["/?view=agent", (d) => d.status === 200],
  ["/photography?view=agent", (d) => d.status === 200],
];

const browser = await chromium.launch();

async function open(width, height) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
  page.on("response", (r) => {
    const u = r.url();
    if (r.status() >= 400 && !u.includes("/.netlify/scripts/rum")) errors.push(`HTTP ${r.status()} ${u}`);
  });
  return { ctx, page, errors };
}

// ---------- Routes: hard load at desktop and phone ----------
for (const [route, ok] of ROUTES) {
  for (const [label, w, h] of [["desktop", 1280, 800], ["phone", 390, 844]]) {
    const { ctx, page, errors } = await open(w, h);
    let status = 0;
    try {
      const resp = await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 });
      status = resp?.status() ?? 0;
      await page.waitForTimeout(800);
      const d = await page.evaluate(() => ({
        text: document.body.innerText,
        h1: [...document.querySelectorAll("h1")].map((h) => h.innerText).join(" | "),
        navbar: !!document.querySelector(".navbar"),
        scrollW: document.documentElement.scrollWidth,
        innerW: innerWidth,
      }));
      d.status = status;
      check(`route ${route} [${label}]`, status === 200 && ok(d), `HTTP ${status}`);
      check(`no horizontal scroll ${route} [${label}]`, d.scrollW <= d.innerW, `${d.scrollW}/${d.innerW}`);
      check(`no console errors ${route} [${label}]`, errors.length === 0, errors.join(" ; ").slice(0, 300));
    } catch (e) {
      check(`route ${route} [${label}]`, false, e.message.slice(0, 200));
    }
    await ctx.close();
  }
}

// ---------- Unknown paths must be a real HTTP 404 (static 404.html) ----------
{
  const { ctx, page } = await open(1280, 800);
  for (const p of ["/this-path-does-not-exist", "/.well-known/openid-configuration", "/certificate/bogus-slug"]) {
    const resp = await page.goto(BASE + p, { waitUntil: "load" });
    check(`real 404 for ${p}`, resp.status() === 404 && (await page.title()).startsWith("Page not found"), `HTTP ${resp.status()}`);
  }
  await ctx.close();
}

// ---------- Game mode checklist (desktop only; hidden <= 800px) ----------
{
  const { ctx, page, errors } = await open(1280, 800);
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const q = (sel) => page.locator(sel).count();

  check("G1 toggle present, game off", (await q(".game-toggle-btn")) === 1 && (await q("canvas.robot-game-canvas")) === 0 && (await q(".cell-counter")) === 0 && (await q(".game-info-btn")) === 0);
  check("G1 toggle title", (await page.getAttribute(".game-toggle-btn", "title")) === "Enable game mode");

  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(200);
  await page.click(".game-toggle-btn");
  await page.waitForTimeout(500);
  const cls = await page.getAttribute(".game-toggle-btn", "class");
  const cv = await page.evaluate(() => { const c = document.querySelector("canvas.robot-game-canvas"); return c ? { w: c.width, h: c.height, pe: getComputedStyle(c).pointerEvents } : null; });
  check("G2 toggle turns on", cls.includes("game-toggle-btn--on") && (await page.getAttribute(".game-toggle-btn", "title")) === "Disable game mode");
  check("G2 scrolls to top", (await page.evaluate(() => window.scrollY)) === 0);
  check("G2 canvas full viewport, pointer-events none", !!cv && cv.w === 1280 && cv.h === 800 && cv.pe === "none", JSON.stringify(cv));
  check("G2 counter reads 0 / 5", (await page.textContent(".cell-counter-text").catch(() => "")) === "0 / 5");
  check("G2 info button appears", (await q(".game-info-btn")) === 1);

  await page.hover(".game-info-btn");
  await page.waitForTimeout(300);
  const infoText = await page.textContent(".robot-game-info").catch(() => "");
  check("G4 info panel on hover", infoText.includes("how to play") && infoText.includes("collect your scattered brain cells"));
  await page.mouse.move(700, 600);
  await page.waitForTimeout(300);
  check("G4 info panel hides on unhover", (await q(".robot-game-info")) === 0);

  await page.waitForTimeout(2500); // spawn bounces
  check("G3 no status overlay while playing", (await q(".robot-game-status")) === 0);
  await page.keyboard.down("ArrowRight"); await page.waitForTimeout(800); await page.keyboard.up("ArrowRight");
  await page.keyboard.press("Space"); await page.waitForTimeout(500);
  check("G5 Space does not scroll page", (await page.evaluate(() => window.scrollY)) === 0);
  check("G5 counter unchanged after moving", (await page.textContent(".cell-counter-text").catch(() => "")) === "0 / 5");

  await page.click("a.explore-link");
  await page.waitForTimeout(1200);
  check("G9 game persists across client-side navigation", page.url().endsWith("/photography") && (await q("canvas.robot-game-canvas")) === 1 && (await page.getAttribute(".game-toggle-btn", "class")).includes("--on"));
  check("G15 underlying links clickable while game on", page.url().endsWith("/photography"));
  await page.goBack(); await page.waitForTimeout(1200);
  check("G9 canvas still present after Back", (await q("canvas.robot-game-canvas")) === 1);

  await page.click(".game-toggle-btn");
  await page.waitForTimeout(500);
  check("G10 toggle off removes all game UI", !(await page.getAttribute(".game-toggle-btn", "class")).includes("--on") && (await q("canvas.robot-game-canvas")) === 0 && (await q(".cell-counter")) === 0 && (await q(".game-info-btn")) === 0 && (await q(".robot-game-status")) === 0);
  check("G10 body has no leftover inline style", (await page.evaluate(() => document.body.getAttribute("style"))) === null);
  await page.evaluate(() => window.scrollTo(0, 900)); await page.waitForTimeout(200);
  check("G10 page scrolls normally after exit", (await page.evaluate(() => window.scrollY)) > 500);

  await page.click(".game-toggle-btn"); await page.waitForTimeout(500);
  check("G11 re-entry resets counter", (await page.textContent(".cell-counter-text").catch(() => "")) === "0 / 5");
  await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(1000);
  check("G12 reload → game off", (await q("canvas.robot-game-canvas")) === 0 && !(await page.getAttribute(".game-toggle-btn", "class")).includes("--on"));

  // pill/game interplay (Phase 3): view-mode pill must be hidden while the game is active
  if ((await q("[data-view-toggle]")) === 1) {
    await page.click(".game-toggle-btn"); await page.waitForTimeout(400);
    check("Pill hidden while game active", (await page.locator("[data-view-toggle]").isVisible()) === false);
    await page.click(".game-toggle-btn"); await page.waitForTimeout(300);
    check("Pill visible again after game exit", (await page.locator("[data-view-toggle]").isVisible()) === true);
  }

  check("G14 zero console errors during game", errors.length === 0, errors.join(" ; ").slice(0, 300));
  await ctx.close();

  const { ctx: c2, page: p2 } = await open(390, 844);
  await p2.goto(BASE + "/", { waitUntil: "networkidle" }); await p2.waitForTimeout(600);
  const phone = await p2.evaluate(() => { const b = document.querySelector(".game-toggle-fixed"); return b ? getComputedStyle(b).display : "missing"; });
  check("G13 game toggle hidden at phone width", phone === "none", phone);
  await c2.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed${failed.length ? ` — FAILED: ${failed.map((f) => f.id).join(", ")}` : ""}`);
process.exit(failed.length ? 1 : 0);
