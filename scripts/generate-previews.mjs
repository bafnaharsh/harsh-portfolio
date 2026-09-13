// Hover-preview thumbnail generator.
//
// Writes the three WebP thumbnails that <HoverPreview image={…}> shows above
// its text: public/previews/{github,linkedin,resume}.webp. Run it once (or
// again whenever the GitHub profile / résumé PDF changes) and commit the
// output — the site itself never runs this.
//
// Usage:
//   node scripts/generate-previews.mjs              # regenerate all three
//   node scripts/generate-previews.mjs github       # only the named targets
//   node scripts/generate-previews.mjs --live       # try real screenshots first
//   node scripts/generate-previews.mjs --headed     # watch the browser work
//
// How each one is produced (no npm packages beyond the existing Playwright):
//   github.webp   A GitHub dark-mode ("dark dimmed") profile page rendered here
//                 at 1120x700 and downscaled to 560x350 (16:10). Only facts
//                 from src/data/portfolio.js are used — name, the username from
//                 portfolio.links.github, role, location, summary, tech stack,
//                 and public/profile.webp as the avatar. No invented repos,
//                 star counts, follower counts or contribution activity.
//   linkedin.webp The same treatment in LinkedIn's dark theme: name, headline,
//                 location, summary and the same avatar. No invented followers,
//                 connection counts, posts or activity.
//
// Both sites are rendered rather than screenshotted because LinkedIn serves
// anonymous visitors an auth wall, and the live GitHub page shows a different,
// badly cropped avatar than the one the site itself uses. Pass --live to try
// the real screenshots instead (dark colour scheme, banners dismissed, a
// realistic user agent on retry); a LinkedIn capture that turns out to be an
// auth wall is still discarded in favour of the rendered card.
//   resume.webp   Headless Chromium cannot screenshot a PDF, so public/ is
//                 served over a throwaway local HTTP server, pdf.js is loaded
//                 from cdnjs into a page on that origin, page 1 of
//                 portfolio.links.resume is rendered to a <canvas> at 2x and
//                 the canvas element is screenshotted.
//
// WebP encoding reuses the same trick as scripts/optimize-images.mjs: decode
// the PNG in the page, draw it into a canvas with step-wise halving for a clean
// downscale, and re-encode with canvas.toDataURL("image/webp", quality).

import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { portfolio } from "../src/data/portfolio.js";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PUBLIC_DIR = join(ROOT, "public");
const OUT_DIR = join(PUBLIC_DIR, "previews");
const PORT = 4178; // throwaway static server for the PDF render only

const { profile, links } = portfolio;

const args = process.argv.slice(2);
const HEADED = args.includes("--headed");
const LIVE = args.includes("--live");
const only = args.filter((a) => !a.startsWith("--"));
const wanted = (name) => only.length === 0 || only.includes(name);

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/131.0.0.0 Safari/537.36";

// pdf.js builds to try, in order. The UMD build avoids cross-origin module
// worker restrictions; pdf.js wraps the CDN worker in a blob itself.
const PDFJS_CDNS = [
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105",
];

const MIME = {
  ".pdf": "application/pdf",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".html": "text/html; charset=utf-8",
};

const log = (...a) => console.log(...a);

// ---------------------------------------------------------------------------
// WebP encoding / downscaling, done inside the browser.
// ---------------------------------------------------------------------------

/**
 * @param {import("playwright").Page} page a scratch page (any origin)
 * @param {Buffer} png source image bytes
 * @param {{width:number,height:number}|{maxWidth:number,maxHeight:number}} fit
 * @param {number} quality
 * @returns {Promise<{buffer:Buffer,width:number,height:number}>}
 */
const encodeWebp = async (page, png, fit, quality) => {
  const src = `data:image/png;base64,${png.toString("base64")}`;
  const out = await page.evaluate(
    async ({ src, fit, quality }) => {
      const img = new Image();
      img.src = src;
      await img.decode();

      let tw;
      let th;
      if ("width" in fit) {
        tw = fit.width;
        th = fit.height;
      } else {
        const scale = Math.min(fit.maxWidth / img.width, fit.maxHeight / img.height, 1);
        tw = Math.round(img.width * scale);
        th = Math.round(img.height * scale);
      }

      // Step-wise halving keeps downscaled text far cleaner than one big draw.
      let cw = img.width;
      let ch = img.height;
      let canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      canvas.getContext("2d").drawImage(img, 0, 0, cw, ch);
      while (cw > tw * 2 && ch > th * 2) {
        const nw = Math.max(tw, Math.round(cw / 2));
        const nh = Math.max(th, Math.round(ch / 2));
        const next = document.createElement("canvas");
        next.width = nw;
        next.height = nh;
        const ctx = next.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(canvas, 0, 0, nw, nh);
        canvas = next;
        cw = nw;
        ch = nh;
      }
      const final = document.createElement("canvas");
      final.width = tw;
      final.height = th;
      const fctx = final.getContext("2d");
      fctx.imageSmoothingQuality = "high";
      fctx.drawImage(canvas, 0, 0, tw, th);
      return { url: final.toDataURL("image/webp", quality), width: tw, height: th };
    },
    { src, fit, quality },
  );

  if (!out.url.startsWith("data:image/webp")) throw new Error("browser did not produce WebP");
  return {
    buffer: Buffer.from(out.url.slice(out.url.indexOf(",") + 1), "base64"),
    width: out.width,
    height: out.height,
  };
};

const write = (name, { buffer, width, height }) => {
  mkdirSync(OUT_DIR, { recursive: true });
  const file = join(OUT_DIR, name);
  writeFileSync(file, buffer);
  log(`  wrote public/previews/${name} — ${width}x${height}px, ${statSync(file).size} bytes`);
  return { file, width, height, bytes: statSync(file).size };
};

// ---------------------------------------------------------------------------
// Shared bits for the two rendered pages.
// ---------------------------------------------------------------------------

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

// The site's own avatar, so both thumbnails show the same picture the portfolio
// uses rather than whatever crop the live profile happens to have.
const avatarDataUrl = () =>
  `data:image/webp;base64,${readFileSync(join(PUBLIC_DIR, "profile.webp")).toString("base64")}`;

/** Render an HTML string at 1120x700 and encode it as a 560x350 WebP. */
const renderPage = async (browser, scratch, html) => {
  const ctx = await browser.newContext({ viewport: { width: 1120, height: 700 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.waitForTimeout(300);
  const png = await page.screenshot({ type: "png" });
  await ctx.close();
  return encodeWebp(scratch, png, { width: 560, height: 350 }, 0.8);
};

// ---------------------------------------------------------------------------
// github.webp
// ---------------------------------------------------------------------------

// The username is derived from the URL in portfolio.js, never hardcoded.
const githubHandle = () => links.github.replace(/\/+$/, "").split("/").pop();

const OCTOCAT =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49" +
  "-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82" +
  ".72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15" +
  "-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82" +
  ".44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2" +
  " 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z";

const githubPageHtml = () => {
  const handle = githubHandle();
  const chips = portfolio.about.techStack.map((t) => `<span class="chip">${esc(t)}</span>`).join("");
  return `<!doctype html><meta charset="utf-8"><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{width:1120px;height:700px;background:#0d1117;color:#e6edf3;
         font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
    .top{height:56px;background:#010409;border-bottom:1px solid #30363d;
         display:flex;align-items:center;gap:18px;padding:0 32px}
    .top svg{width:30px;height:30px;fill:#e6edf3;flex:none}
    .search{width:280px;height:32px;border:1px solid #30363d;border-radius:6px;background:#0d1117;
            display:flex;align-items:center;padding:0 10px;color:#6e7681;font-size:14px}
    .topnav{display:flex;gap:18px;font-size:15px;color:#e6edf3}
    .tabs{display:flex;gap:26px;padding:0 32px;border-bottom:1px solid #30363d;background:#010409;
          font-size:15px;color:#e6edf3}
    .tabs div{padding:12px 2px;border-bottom:2px solid transparent}
    .tabs div.on{border-bottom-color:#f78166;font-weight:600}
    .wrap{display:flex;gap:28px;padding:26px 32px}
    .side{width:290px;flex:none}
    .avatar{width:280px;height:280px;border-radius:50%;border:1px solid #30363d;object-fit:cover;
            object-position:center;display:block;background:#161b22}
    .name{margin-top:18px;font-size:30px;font-weight:600;line-height:1.2}
    .handle{font-size:22px;font-weight:300;color:#8d96a0;line-height:1.3}
    .bio{margin-top:14px;font-size:16px;color:#e6edf3}
    .follow{margin-top:16px;height:36px;border:1px solid #3d444d;border-radius:6px;background:#21262d;
            display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:600}
    .loc{margin-top:14px;font-size:15px;color:#8d96a0}
    .main{flex:1 1 auto;min-width:0}
    .readme{border:1px solid #30363d;border-radius:6px;overflow:hidden}
    .readme .h{background:#161b22;border-bottom:1px solid #30363d;padding:10px 16px;
               font-size:14px;color:#8d96a0}
    .readme .h b{color:#e6edf3;font-weight:600}
    .readme .c{padding:20px 22px}
    .readme h1{font-size:26px;font-weight:600;padding-bottom:10px;border-bottom:1px solid #30363d}
    .readme p{margin-top:14px;font-size:16px;line-height:1.6;color:#e6edf3}
    .readme h2{margin-top:22px;font-size:20px;font-weight:600}
    .chips{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px}
    .chip{border:1px solid #3d444d;border-radius:999px;padding:4px 12px;font-size:14px;color:#4493f8;
          background:#0d1117}
  </style>
  <div class="top">
    <svg viewBox="0 0 16 16"><path d="${OCTOCAT}"/></svg>
    <div class="search">Type <b style="color:#6e7681">/</b> to search</div>
    <div class="topnav"><span>Pull requests</span><span>Issues</span><span>Marketplace</span><span>Explore</span></div>
  </div>
  <div class="tabs"><div class="on">Overview</div><div>Repositories</div><div>Projects</div><div>Packages</div><div>Stars</div></div>
  <div class="wrap">
    <div class="side">
      <img class="avatar" src="${avatarDataUrl()}" alt="">
      <div class="name">${esc(profile.name)}</div>
      <div class="handle">${esc(handle)}</div>
      <div class="bio">${esc(profile.role)}</div>
      <div class="follow">Follow</div>
      <div class="loc">${esc(profile.location)}</div>
    </div>
    <div class="main">
      <div class="readme">
        <div class="h"><b>${esc(handle)}</b>/<b>README.md</b></div>
        <div class="c">
          <h1>${esc(profile.greeting.before.trim())} ${esc(profile.name)}</h1>
          <p>${esc(profile.summary)}</p>
          <h2>${esc(portfolio.about.techIntro)}</h2>
          <div class="chips">${chips}</div>
        </div>
      </div>
    </div>
  </div>`;
};

const dismissOverlays = async (page) => {
  // Cookie / sign-in banners that can cover the profile. Best-effort only.
  const selectors = [
    'button:has-text("Accept all")',
    'button:has-text("Accept")',
    'button[aria-label*="Close" i]',
    'button[aria-label*="Dismiss" i]',
    ".js-cookie-consent-reject-all",
  ];
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    try {
      if (await el.isVisible({ timeout: 400 })) await el.click({ timeout: 800 });
    } catch {
      /* not present — fine */
    }
  }
  // Remove anything still pinned over the page (sign-in dialogs, toasts).
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("dialog[open], .js-notice, [role='dialog']")) {
      el.remove();
    }
  });
};

const captureGithub = async (browser, scratch) => {
  if (!LIVE) {
    log("  github: rendering a GitHub dark-mode profile page from portfolio.js facts only");
    return { ...(await renderPage(browser, scratch, githubPageHtml())), real: false };
  }
  const url = links.github;
  for (const withUa of [true, false]) {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      colorScheme: "dark",
      userAgent: withUa ? UA : undefined,
    });
    const page = await ctx.newPage();
    try {
      const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      const status = res ? res.status() : 0;
      if (status >= 400) throw new Error(`HTTP ${status}`);
      await page.waitForTimeout(2500);
      await dismissOverlays(page);
      await page.waitForTimeout(400);
      const blocked = await page.evaluate(() =>
        /rate limit|unusual traffic|access denied|sign in to github/i.test(
          document.body.innerText.slice(0, 600),
        ),
      );
      if (blocked) throw new Error("blocked / rate limited");
      const png = await page.screenshot({ type: "png" });
      await ctx.close();
      log(`  github: captured ${url} (ua=${withUa ? "realistic" : "default"})`);
      return { ...(await encodeWebp(scratch, png, { width: 560, height: 350 }, 0.8)), real: true };
    } catch (err) {
      await ctx.close();
      log(`  github: attempt (ua=${withUa}) failed — ${err.message}`);
    }
  }
  log(`  github: could not capture ${url} — falling back to the rendered page`);
  return { ...(await renderPage(browser, scratch, githubPageHtml())), real: false };
};

// ---------------------------------------------------------------------------
// linkedin.webp — real screenshot if it is really the profile, else a card
// built only from portfolio.js facts.
// ---------------------------------------------------------------------------

const AUTH_WALL = /authwall|\/login|\/signup|uas\/login|checkpoint/i;

const looksLikeAuthWall = async (page) => {
  if (AUTH_WALL.test(page.url())) return true;
  return page.evaluate(() => {
    const t = `${document.title} ${document.body.innerText.slice(0, 1200)}`.toLowerCase();
    return (
      /sign in to|join linkedin|new to linkedin|sign up|agree & join|continue with google/.test(t) ||
      document.querySelector("input[name='session_key'], form.login__form") !== null
    );
  });
};

const linkedinCardHtml = () => {
  const avatar = avatarDataUrl();
  // LinkedIn's dark theme palette (#000 page, #1D2226 surfaces, #70B5F9 accent)
  // so the thumbnail sits inside the site's navy card instead of glaring white.
  // Every string below comes from src/data/portfolio.js — nothing is invented.
  return `<!doctype html><meta charset="utf-8"><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{width:1120px;height:700px;background:#000;color:rgba(255,255,255,.9);
         font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;padding:0}
    .nav{height:60px;background:#1d2226;border-bottom:1px solid rgba(255,255,255,.1);
         display:flex;align-items:center;gap:16px;padding:0 40px}
    .logo{width:34px;height:34px;border-radius:6px;background:#70b5f9;color:#1d2226;
          font-weight:800;font-size:21px;display:flex;align-items:center;justify-content:center;line-height:1}
    .search{width:300px;height:34px;border-radius:4px;background:rgba(255,255,255,.08);
            display:flex;align-items:center;padding:0 12px;color:rgba(255,255,255,.35);font-size:15px}
    .main{padding:24px 40px;display:flex;flex-direction:column;gap:12px}
    .card{background:#1d2226;border:1px solid rgba(255,255,255,.12);border-radius:10px;overflow:hidden}
    .banner{height:150px;background:radial-gradient(120% 160% at 18% 0%,#1b5f9e 0%,#0a3d66 48%,#08243c 100%)}
    .body{padding:0 32px 26px;position:relative}
    .avatar{width:148px;height:148px;border-radius:50%;border:4px solid #1d2226;object-fit:cover;
            margin-top:-74px;display:block;background:#2b3238}
    .top{display:flex;align-items:flex-end;justify-content:space-between}
    .who{padding-top:14px}
    .name{font-size:38px;font-weight:600;letter-spacing:-.3px;color:#fff}
    .headline{margin-top:6px;font-size:22px;color:rgba(255,255,255,.9)}
    .loc{margin-top:8px;font-size:17px;color:rgba(255,255,255,.55)}
    .actions{margin-top:20px;display:flex;gap:10px}
    .btn{height:40px;padding:0 22px;border-radius:20px;font-size:17px;font-weight:600;
         display:flex;align-items:center}
    .btn.p{background:#70b5f9;color:#1d2226}
    .btn.s{border:1.5px solid #70b5f9;color:#70b5f9}
    .in{font-size:24px;font-weight:700;color:#70b5f9;padding-bottom:6px}
    .sec{padding:22px 32px}
    .sec h2{font-size:24px;font-weight:600;color:#fff;margin-bottom:10px}
    .sec p{font-size:17px;line-height:1.5;color:rgba(255,255,255,.75)}
  </style>
  <div class="nav"><div class="logo">in</div><div class="search">Search</div></div>
  <div class="main">
    <div class="card">
      <div class="banner"></div>
      <div class="body">
        <img class="avatar" src="${avatar}" alt="">
        <div class="top">
          <div class="who">
            <div class="name">${esc(profile.name)}</div>
            <div class="headline">${esc(profile.role)}</div>
            <div class="loc">${esc(profile.location)}</div>
          </div>
          <div class="in">in</div>
        </div>
        <div class="actions"><div class="btn p">Message</div><div class="btn s">More</div></div>
      </div>
    </div>
    <div class="card sec"><h2>About</h2><p>${esc(profile.summary)}</p></div>
  </div>`;
};

const captureLinkedin = async (browser, scratch) => {
  if (LIVE) {
    const url = links.linkedin;
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      colorScheme: "dark",
      userAgent: UA,
    });
    const page = await ctx.newPage();
    let real = null;
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(3000);
      await dismissOverlays(page);
      if (await looksLikeAuthWall(page)) {
        log(`  linkedin: ${page.url()} is an auth wall — discarding the capture`);
      } else {
        real = await page.screenshot({ type: "png" });
        log(`  linkedin: captured the real profile at ${page.url()}`);
      }
    } catch (err) {
      log(`  linkedin: live capture failed — ${err.message}`);
    }
    await ctx.close();
    if (real) return { ...(await encodeWebp(scratch, real, { width: 560, height: 350 }, 0.8)), real: true };
  }

  log("  linkedin: rendering a LinkedIn dark-mode profile page from portfolio.js facts only");
  return { ...(await renderPage(browser, scratch, linkedinCardHtml())), real: false };
};

// ---------------------------------------------------------------------------
// resume.webp — pdf.js renders page 1 of the PDF to a canvas
// ---------------------------------------------------------------------------

const startStaticServer = () =>
  new Promise((ok, bad) => {
    const server = createServer((req, res) => {
      const path = decodeURIComponent(req.url.split("?")[0]);
      if (path === "/" || path === "/index.html") {
        res.writeHead(200, { "content-type": MIME[".html"] });
        res.end("<!doctype html><meta charset=utf-8><title>pdf host</title><body></body>");
        return;
      }
      const file = join(PUBLIC_DIR, path.replace(/^\/+/, ""));
      if (!file.startsWith(PUBLIC_DIR)) {
        res.writeHead(403).end();
        return;
      }
      try {
        const body = readFileSync(file);
        res.writeHead(200, { "content-type": MIME[extname(file).toLowerCase()] || "application/octet-stream" });
        res.end(body);
      } catch {
        res.writeHead(404).end();
      }
    });
    server.on("error", bad);
    server.listen(PORT, "127.0.0.1", () => ok(server));
  });

const captureResume = async (browser, scratch) => {
  const server = await startStaticServer();
  const origin = `http://127.0.0.1:${PORT}`;
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 1400 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  try {
    for (const cdn of PDFJS_CDNS) {
      await page.goto(`${origin}/`, { waitUntil: "domcontentloaded" });
      // setContent keeps the document origin, so fetching the PDF stays same-origin.
      await page.setContent(
        `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#fff}
         canvas{display:block}</style><canvas id="c"></canvas>
         <script src="${cdn}/pdf.min.js"></script>`,
        { waitUntil: "load" },
      );
      const ok = await page.evaluate(
        async ({ cdn, pdfUrl }) => {
          const lib = window.pdfjsLib;
          if (!lib) return { ok: false, why: "pdfjsLib missing (CDN script did not load)" };
          lib.GlobalWorkerOptions.workerSrc = `${cdn}/pdf.worker.min.js`;
          try {
            const data = await fetch(pdfUrl).then((r) => r.arrayBuffer());
            const doc = await lib.getDocument({ data }).promise;
            const pdfPage = await doc.getPage(1);
            const viewport = pdfPage.getViewport({ scale: 2 });
            const canvas = document.getElementById("c");
            canvas.width = Math.round(viewport.width);
            canvas.height = Math.round(viewport.height);
            const ctx2d = canvas.getContext("2d");
            ctx2d.fillStyle = "#fff";
            ctx2d.fillRect(0, 0, canvas.width, canvas.height);
            await pdfPage.render({ canvasContext: ctx2d, viewport }).promise;
            return { ok: true, w: canvas.width, h: canvas.height, pages: doc.numPages };
          } catch (e) {
            return { ok: false, why: String(e && e.message ? e.message : e) };
          }
        },
        { cdn, pdfUrl: links.resume },
      );
      if (ok.ok) {
        log(`  resume: pdf.js ${cdn.split("/").pop()} rendered page 1 of ${ok.pages} at ${ok.w}x${ok.h}`);
        await page.setViewportSize({ width: ok.w, height: Math.min(ok.h, 4000) });
        const png = await page.locator("#c").screenshot({ type: "png" });
        return await encodeWebp(scratch, png, { maxWidth: 420, maxHeight: 560 }, 0.82);
      }
      errors.push(`${cdn}: ${ok.why}`);
      log(`  resume: ${cdn.split("/").pop()} failed — ${ok.why}`);
    }
    throw new Error(`pdf.js render failed. Tried:\n    ${errors.join("\n    ")}`);
  } finally {
    await ctx.close();
    server.close();
  }
};

// ---------------------------------------------------------------------------

const main = async () => {
  const browser = await chromium.launch({ headless: !HEADED });
  const scratchCtx = await browser.newContext();
  const scratch = await scratchCtx.newPage();
  await scratch.goto("about:blank");

  const results = [];
  const failures = [];
  const run = async (name, fn) => {
    if (!wanted(name)) return;
    log(`\n${name}.webp`);
    try {
      const out = await fn();
      results.push({ name, ...write(`${name}.webp`, out), real: out.real });
    } catch (err) {
      failures.push(`${name}: ${err.message}`);
      log(`  FAILED — ${err.message}`);
    }
  };

  await run("github", () => captureGithub(browser, scratch));
  await run("linkedin", () => captureLinkedin(browser, scratch));
  await run("resume", () => captureResume(browser, scratch));

  await scratchCtx.close();
  await browser.close();

  log("\nSummary");
  for (const r of results) {
    const note = r.real === undefined ? "" : r.real ? " (real capture)" : " (rendered card, portfolio.js facts only)";
    log(`  ${r.name}.webp  ${r.width}x${r.height}  ${r.bytes} bytes${note}`);
  }
  if (failures.length) {
    log("\nFailures:");
    for (const f of failures) log(`  ${f}`);
    process.exitCode = 1;
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
