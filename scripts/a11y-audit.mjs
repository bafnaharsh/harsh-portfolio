// Accessibility audit: WCAG 2.2 AA text-contrast sweep + keyboard (Tab) walk.
//
//   node scripts/a11y-audit.mjs [baseUrl]            (default http://localhost:4173)
//   node scripts/a11y-audit.mjs [baseUrl] --json out.json
//
// Contrast: for every visible element that owns a non-empty text node, the
// computed text colour is compared against the *effective* background — the
// first ancestor background that is not fully transparent, composited down to
// the page background (#0a192f). Threshold is 4.5:1, relaxed to 3:1 for large
// text (>= 24px, or >= 18.66px at font-weight >= 700).
//
// Game-mode overlays (.robot-game-*, .cell-counter, .game-toggle-*) are
// reported but flagged EXEMPT — they are owned by the game and left alone.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const BASE = (process.argv[2] || "http://localhost:4173").replace(/\/$/, "");
const jsonFlag = process.argv.indexOf("--json");
const JSON_OUT = jsonFlag > -1 ? process.argv[jsonFlag + 1] : null;

const ROUTES = ["/", "/photography", "/resume", "/certificate/think-tank"];
const VIEWPORTS = [
  ["desktop", 1280, 800],
  ["phone", 390, 844],
];
const PAGE_BG = "#0a192f";

// --- Code that runs inside the page ---------------------------------------
const CONTRAST_PROBE = (pageBg) => {
  const parseColor = (str) => {
    if (!str) return null;
    if (str === "transparent") return [0, 0, 0, 0];
    const m = str.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const parts = m[1].split(/[,/]/).map((p) => parseFloat(p.trim()));
      return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
    }
    const hex = str.match(/^#([0-9a-f]{6})$/i);
    if (hex) {
      const n = parseInt(hex[1], 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
    }
    return null;
  };

  // src over dst (both [r,g,b,a]); dst assumed opaque.
  const over = (src, dst) => {
    const a = src[3];
    return [
      src[0] * a + dst[0] * (1 - a),
      src[1] * a + dst[1] * (1 - a),
      src[2] * a + dst[2] * (1 - a),
      1,
    ];
  };

  const lum = ([r, g, b]) => {
    const c = [r, g, b].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };

  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const hex = ([r, g, b]) =>
    "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

  const selectorFor = (el) => {
    const parts = [];
    let node = el;
    for (let depth = 0; node && node.nodeType === 1 && depth < 4; depth++) {
      let s = node.tagName.toLowerCase();
      if (node.id) { parts.unshift(s + "#" + node.id); break; }
      const cls = (node.getAttribute("class") || "")
        .trim().split(/\s+/).filter(Boolean).slice(0, 3);
      if (cls.length) s += "." + cls.join(".");
      parts.unshift(s);
      node = node.parentElement;
    }
    return parts.join(" > ");
  };

  const base = parseColor(pageBg);
  const results = [];

  for (const el of document.querySelectorAll("body *")) {
    // Must own direct, non-whitespace text.
    let text = "";
    for (const n of el.childNodes) {
      if (n.nodeType === 3 && n.nodeValue.trim()) text += n.nodeValue.trim() + " ";
    }
    text = text.trim();
    if (!text) continue;

    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;

    // Skip anything faded out by an ancestor (or itself).
    let opacity = 1, p = el;
    while (p && p.nodeType === 1) { opacity *= parseFloat(getComputedStyle(p).opacity || "1"); p = p.parentElement; }
    if (opacity < 0.1) continue;

    // Effective background: collect layers from the element upward until one
    // is opaque, then composite them down onto the page background.
    const layers = [];
    let anc = el, gradient = false;
    while (anc && anc.nodeType === 1) {
      const acs = getComputedStyle(anc);
      if (acs.backgroundImage && acs.backgroundImage !== "none") gradient = true;
      const bg = parseColor(acs.backgroundColor);
      if (bg && bg[3] > 0) {
        layers.push(bg);
        if (bg[3] >= 0.999) break;
      }
      anc = anc.parentElement;
    }
    let bgRgb = base;
    for (let i = layers.length - 1; i >= 0; i--) bgRgb = over(layers[i], bgRgb);

    const fg = parseColor(cs.color);
    if (!fg) continue;
    const fgRgb = fg[3] < 1 ? over(fg, bgRgb) : fg;

    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const required = large ? 3 : 4.5;
    const r = ratio(fgRgb, bgRgb);

    const sel = selectorFor(el);
    const exempt = /robot-game|cell-counter|game-toggle/.test(
      el.className && el.className.baseVal !== undefined ? el.className.baseVal : (el.getAttribute("class") || "")
    ) || /robot-game|cell-counter|game-toggle/.test(sel);

    results.push({
      sel,
      text: text.slice(0, 48),
      fg: hex(fgRgb),
      bg: hex(bgRgb),
      size: Math.round(size * 10) / 10,
      weight,
      large,
      required,
      ratio: Math.round(r * 100) / 100,
      pass: r >= required,
      gradient,
      exempt,
    });
  }
  return results;
};

const TAB_PROBE = () => {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) {
    return { tag: el ? el.tagName.toLowerCase() : "none", boundary: true };
  }
  const cs = getComputedStyle(el);
  const cls = (el.getAttribute("class") || "").trim().split(/\s+/).filter(Boolean).slice(0, 3).join(".");
  const label =
    el.getAttribute("aria-label") ||
    (el.innerText || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40) ||
    el.getAttribute("title") ||
    "";
  const outlineVisible = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
  const shadowVisible = cs.boxShadow !== "none" && cs.boxShadow !== "";
  return {
    boundary: false,
    tag: el.tagName.toLowerCase(),
    cls,
    id: el.id || "",
    label,
    href: el.getAttribute("href") || "",
    outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`,
    boxShadow: shadowVisible ? cs.boxShadow.slice(0, 40) : "none",
    focusRing: outlineVisible || shadowVisible,
    viewToggle: el.hasAttribute("data-view-toggle") || !!el.closest("[data-view-toggle]"),
    key: `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${cls ? "." + cls : ""}|${label}|${el.getAttribute("href") || ""}`,
  };
};

const reveal = async (page) => {
  await page.evaluate(() =>
    document.querySelectorAll(".fade-in-section").forEach((e) => e.classList.add("is-visible"))
  );
  await page.waitForTimeout(300);
};

// --- Run -------------------------------------------------------------------
const browser = await chromium.launch();
const report = { contrast: {}, tabOrder: [], reach: {}, scrolledTab: [] };

// 1) Contrast sweep
const failures = [];
const seen = new Set();
const pairs = new Map(); // unique fg/bg/threshold combos across the whole sweep
for (const route of ROUTES) {
  for (const [label, w, h] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await reveal(page);
    const rows = await page.evaluate(CONTRAST_PROBE, PAGE_BG);
    for (const r of rows) {
      const pk = `${r.fg}|${r.bg}|${r.required}`;
      const prev = pairs.get(pk);
      if (!prev || r.ratio < prev.ratio) pairs.set(pk, { ...r, where: `${route} [${label}]` });
    }
    const bad = rows.filter((r) => !r.pass);
    report.contrast[`${route} [${label}]`] = { checked: rows.length, failed: bad.length };
    for (const r of bad) {
      const k = `${r.sel}|${r.fg}|${r.bg}|${r.size}`;
      if (seen.has(k)) continue;
      seen.add(k);
      failures.push({ ...r, where: `${route} [${label}]` });
    }
    await ctx.close();
  }
}

console.log("=".repeat(96));
console.log("CONTRAST AUDIT (WCAG 2.2 AA) — base " + BASE);
console.log("=".repeat(96));
for (const [k, v] of Object.entries(report.contrast)) {
  console.log(`  ${k.padEnd(34)} elements checked: ${String(v.checked).padStart(4)}   failing: ${v.failed}`);
}
console.log("-".repeat(96));
console.log("EVERY DISTINCT TEXT/BACKGROUND PAIR ON THE SITE (worst instance of each, ascending)");
console.log(
  "STATUS".padEnd(8) + "RATIO".padEnd(9) + "NEED".padEnd(7) + "SIZE".padEnd(7) +
  "FG".padEnd(10) + "BG".padEnd(10) + "EXAMPLE SELECTOR"
);
for (const p of [...pairs.values()].sort((a, b) => a.ratio - b.ratio)) {
  console.log(
    (p.exempt ? "EXEMPT" : p.pass ? "pass" : "FAIL").padEnd(8) +
      `${p.ratio}:1`.padEnd(9) +
      `${p.required}:1`.padEnd(7) +
      `${p.size}${p.weight >= 700 ? "b" : ""}`.padEnd(7) +
      p.fg.padEnd(10) +
      p.bg.padEnd(10) +
      p.sel.slice(-60)
  );
}
console.log("-".repeat(96));
if (!failures.length) {
  console.log("NO CONTRAST FAILURES");
} else {
  console.log(
    "STATUS".padEnd(8) + "RATIO".padEnd(8) + "NEED".padEnd(6) + "SIZE".padEnd(7) +
    "FG".padEnd(10) + "BG".padEnd(10) + "SELECTOR"
  );
  for (const f of failures.sort((a, b) => a.ratio - b.ratio)) {
    console.log(
      (f.exempt ? "EXEMPT" : "FAIL").padEnd(8) +
        `${f.ratio}:1`.padEnd(8) +
        `${f.required}:1`.padEnd(6) +
        `${f.size}${f.weight >= 700 ? "b" : ""}`.padEnd(7) +
        f.fg.padEnd(10) +
        f.bg.padEnd(10) +
        f.sel
    );
    console.log(" ".repeat(8) + `↳ "${f.text}"  @ ${f.where}${f.gradient ? "  [bg-image present]" : ""}`);
  }
}
report.failures = failures;

// 2) Keyboard walk on "/" at 1280x800
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await reveal(page);
await page.evaluate(() => window.scrollTo(0, 0));
await page.mouse.move(2, 2);
await page.evaluate(() => document.body.focus());

const order = [];
let boundaries = 0;
let firstKey = null;
for (let i = 0; i < 160; i++) {
  await page.keyboard.press("Tab");
  await page.waitForTimeout(35);
  const info = await page.evaluate(TAB_PROBE);
  if (info.boundary) {
    boundaries++;
    order.push({ n: order.length + 1, boundary: true, tag: info.tag });
    if (boundaries >= 2) break;
    continue;
  }
  if (firstKey === null) firstKey = info.key;
  else if (info.key === firstKey) {
    order.push({ n: order.length + 1, cycled: true, ...info });
    break;
  }
  order.push({ n: order.length + 1, ...info });
}
report.tabOrder = order;

console.log("\n" + "=".repeat(96));
console.log("KEYBOARD (TAB) WALK — route / @ 1280x800");
console.log("=".repeat(96));
console.log("  #  RING  ELEMENT".padEnd(52) + "NAME / TEXT");
for (const o of order) {
  if (o.boundary) {
    console.log(String(o.n).padStart(3) + "   --   <focus left the page — reached browser chrome / document>");
    continue;
  }
  const el = `<${o.tag}${o.id ? " #" + o.id : ""}${o.cls ? " ." + o.cls : ""}>`;
  console.log(
    String(o.n).padStart(3) + "  " + (o.focusRing ? " YES" : " NO ") + "  " +
      el.padEnd(44).slice(0, 44) + " " + (o.label || o.href) + (o.cycled ? "   <= CYCLED BACK" : "")
  );
}
const noRing = order.filter((o) => !o.boundary && !o.focusRing);
console.log("-".repeat(96));
console.log(`stops: ${order.filter((o) => !o.boundary).length}   without a visible focus indicator: ${noRing.length}`);
if (noRing.length) for (const o of noRing) console.log(`   NO RING: <${o.tag} .${o.cls}> "${o.label}" outline=${o.outline} box-shadow=${o.boxShadow}`);
console.log(
  boundaries || order.some((o) => o.cycled)
    ? "focus trap: NONE (focus cycles / reaches browser chrome)"
    : "focus trap: POSSIBLE — focus never cycled within 160 tabs"
);

// 3) Reachability of the named controls (scroll to bottom first so BackToTop
//    is enabled, then keep tabbing from where we are).
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(400);
const extra = [];
const extraKeys = new Set();
await page.evaluate(() => document.body.focus());
for (let i = 0; i < 200; i++) {
  await page.keyboard.press("Tab");
  await page.waitForTimeout(20);
  const info = await page.evaluate(TAB_PROBE);
  if (info.boundary) continue;
  if (extraKeys.has(info.key)) break;
  extraKeys.add(info.key);
  extra.push(info);
}
report.scrolledTab = extra;

const all = [...order.filter((o) => !o.boundary), ...extra];
const has = (fn) => all.some(fn);
const checks = [
  ["Projects carousel (shell + arrows + dots)", () => has((o) => /projects-carousel/.test(o.cls || ""))],
  ["Certificate pills (.cert-pill)", () => has((o) => /cert-pill/.test(o.cls || ""))],
  ["Photography cards (.photography-card)", () => has((o) => /photography-card/.test(o.cls || ""))],
  ["Back to top (.back-to-top)", () => has((o) => /back-to-top/.test(o.cls || ""))],
  ["Human/Agent pill ([data-view-toggle])", () => has((o) => o.viewToggle)],
];
console.log("\nREACHABILITY (Tab from top, plus a second pass with the page scrolled to the bottom)");
for (const [name, fn] of checks) {
  const ok = fn();
  report.reach[name] = ok;
  console.log(`  ${ok ? "REACHABLE  " : "UNREACHABLE"}  ${name}`);
}
const extraNoRing = extra.filter((o) => !o.focusRing);
if (extraNoRing.length) {
  console.log("  second-pass stops without a focus ring:");
  for (const o of extraNoRing) console.log(`   NO RING: <${o.tag} .${o.cls}> "${o.label}"`);
} else {
  console.log("  second-pass stops without a focus ring: 0");
}

// 4) Dialog focus management + contrast inside the overlays.
console.log("\n" + "=".repeat(96));
console.log("DIALOG FOCUS MANAGEMENT (open -> focus moves in, Escape -> focus returns)");
console.log("=".repeat(96));
report.dialogs = [];
const dialogCases = [
  ["PdfViewerModal (certificate pill)", ".cert-pill", ".pdf-viewer-overlay", ".pdf-viewer-close"],
  ["Lightbox (photography card)", ".photography-card", ".lightbox-overlay", ".lightbox-close"],
];
for (const [name, trigger, overlay, closeSel] of dialogCases) {
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await reveal(page);
  const t = page.locator(trigger).first();
  await t.scrollIntoViewIfNeeded();
  await t.focus();
  const before = await page.evaluate(() => {
    const el = document.activeElement;
    return (el.getAttribute("class") || el.tagName).split(/\s+/)[0] + "|" + (el.getAttribute("aria-label") || (el.innerText || "").trim().slice(0, 30));
  });
  await page.keyboard.press("Enter");
  await page.waitForSelector(overlay, { timeout: 5000 });
  await page.waitForTimeout(400);
  const onOpen = await page.evaluate((cs) => {
    const el = document.activeElement;
    const target = document.querySelector(cs);
    const st = getComputedStyle(el);
    return {
      isClose: el === target,
      tag: el.tagName.toLowerCase(),
      label: el.getAttribute("aria-label") || "",
      ring: (st.outlineStyle !== "none" && parseFloat(st.outlineWidth) > 0) || st.boxShadow !== "none",
    };
  }, closeSel);
  // contrast inside the open dialog
  const dialogRows = await page.evaluate(CONTRAST_PROBE, PAGE_BG);
  const dialogBad = dialogRows.filter((r) => !r.pass && new RegExp(overlay.slice(1).split("-")[0]).test(r.sel));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  const onClose = await page.evaluate(() => {
    const el = document.activeElement;
    return (el.getAttribute("class") || el.tagName).split(/\s+/)[0] + "|" + (el.getAttribute("aria-label") || (el.innerText || "").trim().slice(0, 30));
  });
  const gone = (await page.locator(overlay).count()) === 0;
  const row = { name, before, onOpen, restored: onClose === before, onClose, escClosed: gone, dialogBad: dialogBad.length };
  report.dialogs.push(row);
  console.log(`  ${name}`);
  console.log(`    trigger focused        : ${before}`);
  console.log(`    focus on open          : <${onOpen.tag} aria-label="${onOpen.label}">  is close button: ${onOpen.isClose ? "YES" : "NO"}  visible ring: ${onOpen.ring ? "YES" : "NO"}`);
  console.log(`    Escape closed dialog   : ${gone ? "YES" : "NO"}`);
  console.log(`    focus restored to      : ${onClose}  -> ${row.restored ? "RESTORED" : "NOT RESTORED"}`);
  console.log(`    contrast failures in overlay: ${dialogBad.length}`);
  for (const b of dialogBad) console.log(`      FAIL ${b.ratio}:1 (need ${b.required}) ${b.fg} on ${b.bg}  ${b.sel}`);
}

await ctx.close();
await browser.close();

if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(report, null, 1));
const realFails = failures.filter((f) => !f.exempt).length;
console.log(`\nSUMMARY: ${realFails} non-exempt contrast failure(s), ${failures.length - realFails} exempt (game mode), ${noRing.length} focusable stop(s) without a ring.`);
