import React, { useRef, useEffect, useState } from "react";

// Module-level cache to persist between remounts
const memoryCache = {};

// The pre-computed ASCII particle data is ~290KB, so it is loaded lazily and
// cached on first use instead of being bundled into the initial payload.
let asciiDataPromise = null;
const loadAsciiData = () => {
  if (!asciiDataPromise) {
    asciiDataPromise = import("../assets/asciiData").then((m) => m.asciiData);
  }
  return asciiDataPromise;
};

// Start fetching the particle chunk as soon as this module is evaluated rather
// than waiting for React to mount and run the size effect. The chunk is still
// split out of the initial bundle, it just stops arriving ~200ms late, which
// is what made the portrait visibly pop in after the rest of the hero.
loadAsciiData().catch(() => {});

// ASCII character set from sparse to dense
const CHARS = " .:-=+*#%@".split("");
const CHAR_INDEX = new Map(CHARS.map((c, i) => [c, i]));

const calculateSize = (width) => {
  if (width <= 480) {
    return Math.min(220, width - 40);
  } else if (width <= 768) {
    return Math.min(280, width - 60);
  } else {
    return 400;
  }
};

// Every particle has its own alpha, so the old loop assigned ctx.fillStyle -
// building a fresh "rgba(...)" string - once per particle per frame: ~2665
// string allocations and colour parses every 16ms. Alpha is instead rounded to
// one of ALPHA_LEVELS steps and particles are batched per step, which turns
// that into at most 63 fillStyle assignments from a pre-built table. A 1/63
// alpha step is far below the perceptual threshold for a 5-7px glyph, and
// because every glyph shares the same RGB, source-over compositing of the
// batches is order-independent: the rendered pixels are unchanged.
const ALPHA_LEVELS = 64;
const LEVEL_STYLES = Array.from(
  { length: ALPHA_LEVELS },
  (_, level) => `rgba(100, 255, 218, ${level / (ALPHA_LEVELS - 1)})`
);

const createParticlesFromRaw = (rawParticles) =>
  rawParticles.map((p) => {
    // The shimmer and "breathing" terms are sin/cos of (time * k + constant).
    // Pre-splitting them with the angle-sum identity turns three transcendental
    // calls per particle per frame into three multiply-adds.
    const shimmer = Math.random() * Math.PI * 2;
    const phaseY = p.y * 0.1;
    const phaseX = p.x * 0.1;
    return {
      x: p.x + (Math.random() - 0.5) * 400,
      y: p.y + (Math.random() - 0.5) * 400,
      targetX: p.x,
      targetY: p.y,
      vx: 0,
      vy: 0,
      char: p.char,
      blank: (CHAR_INDEX.get(p.char) || 0) === 0,
      baseAlpha: p.alpha,
      delay: Math.random() * 0.4,
      shCos: Math.cos(shimmer),
      shSin: Math.sin(shimmer),
      byCos: Math.cos(phaseY),
      bySin: Math.sin(phaseY),
      bxCos: Math.cos(phaseX),
      bxSin: Math.sin(phaseX),
    };
  });

const processImage = (img, targetSize) => {
  const canvasWidth = targetSize;
  const canvasHeight = targetSize;
  const offscreen = document.createElement("canvas");
  const offCtx = offscreen.getContext("2d");
  offscreen.width = canvasWidth;
  offscreen.height = canvasHeight;

  const scale = 0.8;
  const imgAspect = img.width / img.height;

  let drawHeight = canvasHeight * scale;
  let drawWidth = drawHeight * imgAspect;

  if (drawWidth > canvasWidth * scale) {
    drawWidth = canvasWidth * scale;
    drawHeight = drawWidth / imgAspect;
  }

  const offsetX = (canvasWidth - drawWidth) / 2;
  const offsetY = (canvasHeight - drawHeight) / 2;

  offCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  const imageData = offCtx.getImageData(0, 0, canvasWidth, canvasHeight);
  const pixels = imageData.data;

  const rawParticles = [];
  const isMobileSize = targetSize <= 280;
  const fontSize = isMobileSize ? 5 : 7;
  const colGap = fontSize * 0.7;
  const rowGap = fontSize * 1.1;

  for (let y = 0; y < canvasHeight; y += rowGap) {
    for (let x = 0; x < canvasWidth; x += colGap) {
      const i = (Math.floor(y) * canvasWidth + Math.floor(x)) * 4;
      const a = pixels[i + 3];

      if (a > 128) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const brightness = (r + g + b) / (3 * 255);
        const charIndex = Math.floor(brightness * (CHARS.length - 1));

        rawParticles.push({
          x: Number(x.toFixed(1)),
          y: Number(y.toFixed(1)),
          char: CHARS[charIndex],
          alpha: Number((0.4 + brightness * 0.6).toFixed(2)),
        });
      }
    }
  }
  return rawParticles;
};

const AsciiPortrait = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const mouseTargetRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef([]);
  const startTimeRef = useRef(null);
  // Set by the animation effect; lets the data effect wake the render loop
  // without a state update (and therefore without a re-render + effect churn).
  const kickRef = useRef(null);
  const [size, setSize] = useState(() => calculateSize(window.innerWidth));

  useEffect(() => {
    const updateSize = () => {
      setSize(calculateSize(window.innerWidth));
    };

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const applyRaw = (raw) => {
      if (cancelled) return;
      particlesRef.current = createParticlesFromRaw(raw);
      startTimeRef.current = performance.now();
      if (kickRef.current) kickRef.current();
    };

    // 1. Memory cache (also seeded from the lazily-loaded static data).
    if (memoryCache[size]) {
      applyRaw(memoryCache[size]);
      return;
    }

    // 2. Lazily loaded pre-computed data.
    loadAsciiData().then((asciiData) => {
      if (cancelled) return;
      if (asciiData[size]) {
        memoryCache[size] = asciiData[size];
        applyRaw(asciiData[size]);
        return;
      }

      // 3. Fallback to on-the-fly image processing for unknown sizes.
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = "/profile.webp";
      img.onload = () => {
        const raw = processImage(img, size);
        memoryCache[size] = raw;
        applyRaw(raw);
      };
    });

    return () => {
      cancelled = true;
    };
  }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const isMobileSize = size <= 280;
    const fontSize = isMobileSize ? 5 : 7;
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const maxDist = size * 0.2; // Proportional to size
    const maxDistSq = maxDist * maxDist;

    // Intrusive singly-linked lists, one head per alpha level, rebuilt each
    // frame without allocating.
    const bucketHead = new Int32Array(ALPHA_LEVELS);
    let bucketNext = new Int32Array(0);

    let rafId = 0;
    let onScreen = true;

    const draw = () => {
      rafId = 0;

      ctx.clearRect(0, 0, size, size);

      const particles = particlesRef.current;
      const n = particles.length;
      if (!n) return;
      if (bucketNext.length < n) bucketNext = new Int32Array(n);
      bucketHead.fill(-1);

      const mouse = mouseRef.current;
      const mouseTarget = mouseTargetRef.current;
      const elapsed = (performance.now() - startTimeRef.current) / 1000;

      mouse.x += (mouseTarget.x - mouse.x) * 0.15;
      mouse.y += (mouseTarget.y - mouse.y) * 0.15;

      const mouseActive = mouse.active;
      const mx = mouse.x;
      const my = mouse.y;

      // Per-frame halves of the angle-sum expansion (see createParticlesFromRaw).
      const s2 = Math.sin(elapsed * 2);
      const c2 = Math.cos(elapsed * 2);
      const s05 = Math.sin(elapsed * 0.5);
      const c05 = Math.cos(elapsed * 0.5);

      // Stays true only if every particle has reached its target and nothing can
      // change the frame any more, in which case the loop parks itself.
      let resting = !mouseActive;

      for (let i = 0; i < n; i++) {
        const p = particles[i];
        const particleTime = elapsed - p.delay;
        if (particleTime < 0) {
          resting = false;
          continue;
        }

        let easedFade = 1;
        let easedMove = 1;
        if (particleTime < 2.5) {
          const fadeProgress = particleTime < 1.5 ? particleTime / 1.5 : 1;
          const invFade = 1 - fadeProgress;
          easedFade = 1 - invFade * invFade;
          const invMove = 1 - particleTime / 2.5;
          easedMove = 1 - invMove * invMove * invMove;
        }

        const isActive = mouseActive || particleTime < 3.0;
        let alpha = p.baseAlpha * easedFade;
        if (isActive) alpha += (s2 * p.shCos + c2 * p.shSin) * 0.1;

        if (mouseActive) {
          const rx = p.x - mx;
          const ry = p.y - my;
          const distSq = rx * rx + ry * ry;

          if (distSq < maxDistSq && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / maxDist) * 4;
            p.vx += (rx / dist) * force;
            p.vy += (ry / dist) * force;
          }
        }

        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;

        const pullStrength = 0.01 + easedMove * 0.08;
        p.vx += dx * pullStrength;
        p.vy += dy * pullStrength;

        if (isActive) {
          p.vx += (s05 * p.byCos + c05 * p.bySin) * 0.15;
          p.vy += (c05 * p.bxCos - s05 * p.bxSin) * 0.15;
          p.vx *= 0.92;
          p.vy *= 0.92;
          resting = false;
        } else {
          // Rapidly settle when inactive
          p.vx *= 0.85;
          p.vy *= 0.85;

          if (particleTime > 4.0 && Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
            p.x = p.targetX;
            p.y = p.targetY;
            p.vx = 0;
            p.vy = 0;
          } else {
            resting = false;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.blank) continue; // blank glyph, nothing to paint
        const level =
          alpha >= 1 ? ALPHA_LEVELS - 1 : alpha > 0 ? Math.round(alpha * (ALPHA_LEVELS - 1)) : 0;
        if (level === 0) continue;
        bucketNext[i] = bucketHead[level];
        bucketHead[level] = i;
      }

      // One fillStyle assignment per occupied alpha level instead of one per
      // particle; the fillText calls themselves are unchanged.
      for (let level = 1; level < ALPHA_LEVELS; level++) {
        let i = bucketHead[level];
        if (i < 0) continue;
        ctx.fillStyle = LEVEL_STYLES[level];
        while (i >= 0) {
          const p = particles[i];
          ctx.fillText(p.char, p.x, p.y);
          i = bucketNext[i];
        }
      }

      if (resting) {
        // Frozen frame: the image cannot change until the pointer, the tab or
        // the viewport does, so stop burning frames until one of them fires.
        // Finish the smoothed pointer's journey off-canvas first so a later
        // re-entry starts from exactly where the old always-on loop would have.
        mouse.x = mouseTarget.x;
        mouse.y = mouseTarget.y;
        return;
      }

      rafId = requestAnimationFrame(draw);
    };

    const start = () => {
      if (!rafId && onScreen && particlesRef.current.length) {
        rafId = requestAnimationFrame(draw);
      }
    };

    const stop = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseTargetRef.current.x = e.clientX - rect.left;
      mouseTargetRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
      start();
    };

    const handleTouchMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouseTargetRef.current.x = touch.clientX - rect.left;
      mouseTargetRef.current.y = touch.clientY - rect.top;
      mouseRef.current.active = true;
      if (e.cancelable) e.preventDefault();
      start();
    };

    const handleLeave = () => {
      mouseRef.current.active = false;
      mouseTargetRef.current.x = -1000;
      mouseTargetRef.current.y = -1000;
      start();
    };

    const handleVisibility = () => {
      if (!document.hidden) start();
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleLeave);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleLeave);
    document.addEventListener("visibilitychange", handleVisibility);

    // Scrolled out of the hero: nothing to show, so nothing to compute.
    let observer = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver((entries) => {
        onScreen = entries[entries.length - 1].isIntersecting;
        if (onScreen) start();
        else stop();
      });
      observer.observe(canvas);
    }

    kickRef.current = start;
    start();

    return () => {
      kickRef.current = null;
      stop();
      if (observer) observer.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleLeave);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      className="simulation-container"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        cursor: "crosshair",
        touchAction: "none",
      }}
    />
  );
};

export default AsciiPortrait;
