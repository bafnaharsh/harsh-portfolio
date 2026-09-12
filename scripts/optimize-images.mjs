// Image optimiser for the portfolio's photography strip and the about photo.
//
// Uses headless Chromium (Playwright, already a devDependency) as the image
// codec: the source file is decoded via a data: URL, drawn into a <canvas>
// with step-wise halving for clean downscaling, then re-encoded with
// canvas.toDataURL("image/webp", quality). No extra npm packages needed.
//
// Usage:
//   node scripts/optimize-images.mjs                 # optimise in place (writes .webp next to sources)
//   node scripts/optimize-images.mjs --dry-run       # report what would be written, write nothing
//   node scripts/optimize-images.mjs --dims <file…>  # print real pixel dimensions of image files
//
// Targets: photography → longest side <= 1600px (never upscaled), quality 0.82;
//          public/assets/about-harsh.webp → 600x600, quality 0.85.
// Aspect ratio is preserved by scaling the longest side to the cap and rounding
// the short side with Math.round. Originals are NOT deleted by this script.

import { chromium } from "playwright";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { extname, basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PHOTO_DIR = join(ROOT, "public", "assets", "photography");
const ABOUT_FILE = join(ROOT, "public", "assets", "about-harsh.webp");

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const toDataUrl = (file) => {
  const type = MIME[extname(file).toLowerCase()] || "application/octet-stream";
  return `data:${type};base64,${readFileSync(file).toString("base64")}`;
};

// Decode + re-encode inside the page. `plan` is either {maxSide} or {width,height}.
async function encode(page, dataUrl, plan, quality) {
  return page.evaluate(
    async ({ dataUrl, plan, quality }) => {
      const img = new Image();
      img.decoding = "sync";
      await new Promise((ok, fail) => {
        img.onload = ok;
        img.onerror = () => fail(new Error("decode failed"));
        img.src = dataUrl;
      });
      const sw = img.naturalWidth;
      const sh = img.naturalHeight;

      let tw;
      let th;
      if (plan.width && plan.height) {
        tw = plan.width;
        th = plan.height;
      } else {
        const long = Math.max(sw, sh);
        if (long <= plan.maxSide) {
          tw = sw;
          th = sh; // never upscale
        } else if (sw >= sh) {
          tw = plan.maxSide;
          th = Math.round((sh * plan.maxSide) / sw);
        } else {
          th = plan.maxSide;
          tw = Math.round((sw * plan.maxSide) / sh);
        }
      }

      // Step-wise halving keeps detail when shrinking a lot in one go.
      let cur = document.createElement("canvas");
      cur.width = sw;
      cur.height = sh;
      let ctx = cur.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0);

      let cw = sw;
      let ch = sh;
      while (cw > tw * 2 && ch > th * 2) {
        const nw = Math.max(tw, Math.round(cw / 2));
        const nh = Math.max(th, Math.round(ch / 2));
        const next = document.createElement("canvas");
        next.width = nw;
        next.height = nh;
        const nctx = next.getContext("2d");
        nctx.imageSmoothingEnabled = true;
        nctx.imageSmoothingQuality = "high";
        nctx.drawImage(cur, 0, 0, cw, ch, 0, 0, nw, nh);
        cur = next;
        cw = nw;
        ch = nh;
      }

      const out = document.createElement("canvas");
      out.width = tw;
      out.height = th;
      const octx = out.getContext("2d");
      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = "high";
      octx.drawImage(cur, 0, 0, cw, ch, 0, 0, tw, th);

      const url = out.toDataURL("image/webp", quality);
      if (!url.startsWith("data:image/webp")) throw new Error("webp encoding unsupported");
      return { sw, sh, tw, th, b64: url.slice(url.indexOf(",") + 1) };
    },
    { dataUrl, plan, quality }
  );
}

async function readDims(page, dataUrl) {
  return page.evaluate(async (url) => {
    const img = new Image();
    await new Promise((ok, fail) => {
      img.onload = ok;
      img.onerror = () => fail(new Error("decode failed"));
      img.src = url;
    });
    return { w: img.naturalWidth, h: img.naturalHeight };
  }, dataUrl);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const dimsIdx = args.indexOf("--dims");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("about:blank");

if (dimsIdx !== -1) {
  const files = args.slice(dimsIdx + 1);
  for (const f of files) {
    const abs = resolve(f);
    const { w, h } = await readDims(page, toDataUrl(abs));
    console.log(`${basename(abs)}\t${w}x${h}\t${statSync(abs).size} bytes`);
  }
  await browser.close();
  process.exit(0);
}

const jobs = [];
for (const name of readdirSync(PHOTO_DIR)) {
  if (!MIME[extname(name).toLowerCase()]) continue;
  if (extname(name).toLowerCase() === ".webp") continue; // already optimised output
  jobs.push({
    src: join(PHOTO_DIR, name),
    dst: join(PHOTO_DIR, basename(name, extname(name)) + ".webp"),
    plan: { maxSide: 1600 },
    quality: 0.82,
  });
}
jobs.push({ src: ABOUT_FILE, dst: ABOUT_FILE, plan: { width: 600, height: 600 }, quality: 0.85 });

const results = [];
for (const job of jobs) {
  const before = statSync(job.src).size;
  const r = await encode(page, toDataUrl(job.src), job.plan, job.quality);
  const buf = Buffer.from(r.b64, "base64");
  if (!dryRun) writeFileSync(job.dst, buf);
  results.push({
    src: basename(job.src),
    dst: basename(job.dst),
    from: `${r.sw}x${r.sh}`,
    to: `${r.tw}x${r.th}`,
    before,
    after: buf.length,
  });
  console.log(
    `${basename(job.src)} ${r.sw}x${r.sh} ${before}B  ->  ${basename(job.dst)} ${r.tw}x${r.th} ${buf.length}B`
  );
}

const tb = results.reduce((a, r) => a + r.before, 0);
const ta = results.reduce((a, r) => a + r.after, 0);
console.log(`TOTAL ${tb}B -> ${ta}B  (saved ${tb - ta}B, ${((1 - ta / tb) * 100).toFixed(1)}%)`);
console.log(JSON.stringify(results, null, 1));

await browser.close();
