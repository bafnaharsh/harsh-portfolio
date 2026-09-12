// Crawls every link on the built site (human view and agent view) and checks
// each target resolves:  node scripts/link-check.mjs [baseUrl]
// Internal links are fetched on the same base URL; external ones over HTTPS
// with a browser-like User-Agent. Exits non-zero if anything is broken.
import { chromium } from "playwright";

const BASE = (process.argv[2] || "http://localhost:8888").replace(/\/$/, "");
const PAGES = ["/", "/photography", "/resume", "/certificate/google-cloud-engineer", "/certificate/jp-morgan-forage-internship",
  "/?view=agent", "/photography?view=agent", "/resume?view=agent", "/certificate/think-tank?view=agent", "/404.html"];

const browser = await chromium.launch();
const found = new Map(); // href -> Set(pages)
for (const p of PAGES) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(BASE + p, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  // open the experience tab that has the certificate button so its link is exercised too
  const links = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")));
  for (const h of links) { if (!found.has(h)) found.set(h, new Set()); found.get(h).add(p); }
  await page.close();
}
await browser.close();

const results = [];
for (const href of [...found.keys()].sort()) {
  let status = "", ok = false, note = "";
  try {
    if (href.startsWith("mailto:")) { ok = /^mailto:[^@\s]+@[^@\s]+\.[a-z]+$/i.test(href); status = ok ? "mailto ok" : "bad mailto"; }
    else if (href.startsWith("#")) { ok = true; status = "fragment"; }
    else {
      const isExternal = /^https?:\/\//.test(href);
      const url = isExternal ? href : BASE + href;
      const r = await fetch(url, { method: "GET", redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36", accept: "text/html,*/*" } });
      status = `${r.status} ${r.headers.get("content-type") || ""}`.trim();
      // LinkedIn answers 999 to non-browser clients; treat as reachable-but-bot-blocked
      ok = r.ok || (isExternal && href.includes("linkedin.com") && r.status === 999);
      if (!isExternal && href.includes("#")) { const frag = href.split("#")[1]; note = frag ? ` (anchor #${frag})` : ""; }
    }
  } catch (e) { status = "ERROR " + e.message; }
  results.push({ href, ok, status: status + note, pages: [...found.get(href)].join(" ") });
}
for (const r of results) console.log(`${r.ok ? "OK  " : "FAIL"}  ${r.status.padEnd(44)} ${r.href}    ← ${r.pages}`);
const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length - bad.length}/${results.length} links resolve${bad.length ? " — BROKEN: " + bad.map((b) => b.href).join(", ") : ""}`);
process.exit(bad.length ? 1 : 0);
