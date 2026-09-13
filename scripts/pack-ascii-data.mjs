/**
 * pack-ascii-data.mjs — regenerate src/assets/asciiData.js in its compact form.
 *
 * WHY
 *   The portrait's particle table used to ship as a literal array of ~6825
 *   `{x, y, char, alpha}` objects (300 kB of source, a 238 kB / 30 kB-gzip
 *   chunk). On a cold first load the browser had to download it, parse 300 kB
 *   of JS and materialise 6825 four-property objects for *all three* canvas
 *   sizes while React was still doing its initial render — right when the
 *   fly-in animation starts. This script re-encodes the same numbers as three
 *   base64 strings (one per canvas size) that decode into typed arrays: 55 kB
 *   of source, ~10 kB gzip, and only the size actually on screen is decoded.
 *
 * ENCODING (per canvas size, one base64 string, byte length = 6 * n)
 *   [0    , 2n) int16 LE  delta-encoded x, in tenths of a CSS pixel
 *   [2n   , 4n) int16 LE  delta-encoded y, in tenths of a CSS pixel
 *   [4n   , 5n) uint8     index into ASCII_CHARS (" .:-=+*#%@")
 *   [5n   , 6n) uint8     alpha in hundredths (40..100)
 *   Structure-of-arrays + delta keeps like bytes adjacent, which is what makes
 *   it gzip to a third of the old JSON (23 kB AoS vs 10 kB SoA+delta).
 *   x/y are exactly one decimal and alpha exactly two decimals in the source
 *   data, so tenths/hundredths integers are lossless; the script asserts this.
 *
 * USAGE
 *   node scripts/pack-ascii-data.mjs                  # re-pack in place (idempotent)
 *   node scripts/pack-ascii-data.mjs --check          # verify only, write nothing
 *   node scripts/pack-ascii-data.mjs --in <file.js>   # pack from another module
 *   node scripts/pack-ascii-data.mjs --out <file.js>  # write somewhere else
 *
 *   The input module may be either shape:
 *     - legacy: `export const asciiData = { "220": [{x,y,char,alpha}, ...], ... }`
 *     - packed: `export function getAsciiParticles(size)` (this script's output)
 *   so it can be re-run against the current file at any time. Every run decodes
 *   what it just wrote and compares all 6825 x / y / char / alpha values against
 *   the input with Object.is; it exits non-zero on any mismatch.
 */
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { gzipSync } from "node:zlib";

const ASCII_CHARS = " .:-=+*#%@";
const ROOT = path.resolve(import.meta.dirname, "..");
const DEFAULT_FILE = path.join(ROOT, "src", "assets", "asciiData.js");

const argOf = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const IN_FILE = path.resolve(argOf("--in", DEFAULT_FILE));
const OUT_FILE = path.resolve(argOf("--out", DEFAULT_FILE));
const CHECK_ONLY = process.argv.includes("--check");

/** Read either module shape and return { [size]: [{x, y, char, alpha}, ...] }. */
const readSource = async (file) => {
  const mod = await import(pathToFileURL(file).href + `?t=${Date.now()}`);
  if (mod.asciiData && Array.isArray(Object.values(mod.asciiData)[0])) {
    return mod.asciiData;
  }
  if (typeof mod.getAsciiParticles === "function") {
    const out = {};
    for (const size of mod.ASCII_SIZES) {
      const d = mod.getAsciiParticles(size);
      out[String(size)] = Array.from({ length: d.count }, (_, i) => ({
        x: d.x[i],
        y: d.y[i],
        char: ASCII_CHARS[d.charIndex[i]],
        alpha: d.alpha[i],
      }));
    }
    return out;
  }
  throw new Error(`${file} exports neither asciiData nor getAsciiParticles`);
};

/** Exact integer or throw: the encoding is only lossless if these hold. */
const exactInt = (value, scale, what) => {
  const scaled = value * scale;
  const rounded = Math.round(scaled);
  if (Math.abs(scaled - rounded) > 1e-9) {
    throw new Error(`${what}=${value} is not an exact multiple of 1/${scale}`);
  }
  return rounded;
};

const encodeSize = (particles) => {
  const n = particles.length;
  const bytes = new Uint8Array(n * 6);
  let prevX = 0;
  let prevY = 0;
  for (let i = 0; i < n; i++) {
    const p = particles[i];
    const x = exactInt(p.x, 10, "x");
    const y = exactInt(p.y, 10, "y");
    const dx = x - prevX;
    const dy = y - prevY;
    if (dx < -32768 || dx > 32767 || dy < -32768 || dy > 32767) {
      throw new Error(`delta out of int16 range at particle ${i}`);
    }
    prevX = x;
    prevY = y;
    bytes[i * 2] = dx & 0xff;
    bytes[i * 2 + 1] = (dx >> 8) & 0xff;
    bytes[n * 2 + i * 2] = dy & 0xff;
    bytes[n * 2 + i * 2 + 1] = (dy >> 8) & 0xff;
    const ci = ASCII_CHARS.indexOf(p.char);
    if (ci < 0) throw new Error(`char ${JSON.stringify(p.char)} is not in ASCII_CHARS`);
    bytes[n * 4 + i] = ci;
    bytes[n * 5 + i] = exactInt(p.alpha, 100, "alpha");
  }
  return Buffer.from(bytes).toString("base64");
};

/** Mirror of the decoder that ships in asciiData.js, used to verify the output. */
const decodeSize = (b64) => {
  const bytes = Buffer.from(b64, "base64");
  const n = bytes.length / 6;
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  const alpha = new Float64Array(n);
  const charIndex = new Uint8Array(n);
  let ax = 0;
  let ay = 0;
  for (let i = 0; i < n; i++) {
    ax += (((bytes[i * 2] | (bytes[i * 2 + 1] << 8)) << 16) >> 16);
    ay += (((bytes[n * 2 + i * 2] | (bytes[n * 2 + i * 2 + 1] << 8)) << 16) >> 16);
    x[i] = ax / 10;
    y[i] = ay / 10;
    charIndex[i] = bytes[n * 4 + i];
    alpha[i] = bytes[n * 5 + i] / 100;
  }
  return { count: n, x, y, charIndex, alpha };
};

const render = (packed, sizes) => `// GENERATED by scripts/pack-ascii-data.mjs — do not edit by hand.
//
// Pre-computed ASCII portrait particles for the three canvas sizes the layout
// can produce (see calculateSize in AsciiPortrait.jsx). Stored as one base64
// blob per size instead of an array of {x, y, char, alpha} objects: the old
// literal form was 300 kB of source that V8 had to parse and turn into 6825
// objects for every size on first load, which collided with React's initial
// render. Here the module body is three string literals, and only the size
// actually on screen is ever decoded.
//
// Layout per blob (n = byteLength / 6):
//   [0 , 2n) int16 LE delta-encoded x, tenths of a CSS pixel
//   [2n, 4n) int16 LE delta-encoded y, tenths of a CSS pixel
//   [4n, 5n) uint8    index into ASCII_CHARS
//   [5n, 6n) uint8    alpha in hundredths
// Tenths/hundredths are exact: the generator asserts every source value is a
// whole number of tenths (x, y) or hundredths (alpha) and re-decodes its own
// output, comparing every x / y / char / alpha of all
// ${sizes.reduce((s, k) => s + packed[k].count, 0)} particles with Object.is before writing.

export const ASCII_CHARS = " .:-=+*#%@";

export const ASCII_SIZES = [${sizes.join(", ")}];

const BLOBS = {
${sizes.map((k) => `  ${k}:\n    "${packed[k].b64}",`).join("\n")}
};

const cache = {};

/**
 * Decode one canvas size into a structure-of-arrays particle table.
 * @param {number} size one of ASCII_SIZES
 * @returns {{count: number, x: Float64Array, y: Float64Array,
 *            charIndex: Uint8Array, alpha: Float64Array} | null}
 */
export function getAsciiParticles(size) {
  const cached = cache[size];
  if (cached !== undefined) return cached;

  const b64 = BLOBS[size];
  if (!b64) {
    cache[size] = null;
    return null;
  }

  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);

  const count = len / 6;
  const x = new Float64Array(count);
  const y = new Float64Array(count);
  const alpha = new Float64Array(count);
  const yOffset = count * 2;
  let ax = 0;
  let ay = 0;
  for (let i = 0; i < count; i++) {
    const j = i * 2;
    // int16 little-endian, sign-extended without relying on platform byte order.
    ax += ((bytes[j] | (bytes[j + 1] << 8)) << 16) >> 16;
    ay += ((bytes[yOffset + j] | (bytes[yOffset + j + 1] << 8)) << 16) >> 16;
    x[i] = ax / 10;
    y[i] = ay / 10;
    alpha[i] = bytes[count * 5 + i] / 100;
  }
  const charIndex = bytes.subarray(count * 4, count * 5);

  const decoded = { count, x, y, charIndex, alpha };
  cache[size] = decoded;
  return decoded;
}
`;

const source = await readSource(IN_FILE);
const sizes = Object.keys(source)
  .map(Number)
  .sort((a, b) => a - b);

const packed = {};
for (const size of sizes) {
  const particles = source[String(size)];
  packed[size] = { b64: encodeSize(particles), count: particles.length };
}

// Verify: decode what we just encoded and compare every single value.
let checked = 0;
for (const size of sizes) {
  const original = source[String(size)];
  const d = decodeSize(packed[size].b64);
  if (d.count !== original.length) {
    throw new Error(`size ${size}: decoded ${d.count} particles, expected ${original.length}`);
  }
  for (let i = 0; i < d.count; i++) {
    const p = original[i];
    if (!Object.is(d.x[i], p.x)) throw new Error(`size ${size} #${i}: x ${d.x[i]} !== ${p.x}`);
    if (!Object.is(d.y[i], p.y)) throw new Error(`size ${size} #${i}: y ${d.y[i]} !== ${p.y}`);
    if (ASCII_CHARS[d.charIndex[i]] !== p.char) {
      throw new Error(`size ${size} #${i}: char ${ASCII_CHARS[d.charIndex[i]]} !== ${p.char}`);
    }
    if (!Object.is(d.alpha[i], p.alpha)) {
      throw new Error(`size ${size} #${i}: alpha ${d.alpha[i]} !== ${p.alpha}`);
    }
    checked += 4;
  }
}

const out = render(packed, sizes);
const before = await readFile(IN_FILE);
process.stdout.write(
  `input   ${path.relative(ROOT, IN_FILE)}  ${before.length} B raw, ${gzipSync(before, { level: 9 }).length} B gzip\n` +
    `output  ${path.relative(ROOT, OUT_FILE)}  ${Buffer.byteLength(out)} B raw, ${gzipSync(Buffer.from(out), { level: 9 }).length} B gzip\n` +
    sizes.map((s) => `  size ${s}: ${packed[s].count} particles, ${packed[s].b64.length} base64 chars\n`).join("") +
    `verified ${checked} values across ${sizes.length} sizes: lossless\n`
);

if (CHECK_ONLY) {
  process.stdout.write("--check: nothing written\n");
} else {
  await writeFile(OUT_FILE, out);
  process.stdout.write(`wrote ${path.relative(ROOT, OUT_FILE)}\n`);
}
