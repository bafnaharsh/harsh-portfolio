import React, { useRef, useEffect, useState, useCallback } from "react";
import "../styles/RobotGame.css";

const SCALE   = 2;
const PX_W    = 16;
const PX_H    = 18;
const ALIEN_W = PX_W * SCALE;
const ALIEN_H = PX_H * SCALE;

const GRAVITY        = 0.22;
const JUMP_FORCE     = -7;
const MAX_SPEED      = 1.8;
const FRICTION       = 0.82;
const BLOCK_H        = 8;
const SPAWN_INTERVAL = 22;

function drawAlien(ctx, x, y, frame, onGround, isIdle) {
  const B = "#8892b0";
  const T = "#64ffda";
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(SCALE, SCALE);
  const wf  = !isIdle && onGround ? Math.floor(frame / 10) % 2 : 0;
  const bob = isIdle ? (Math.sin(frame * 0.06) > 0.3 ? 1 : 0) : 0;
  ctx.fillStyle = B;
  ctx.fillRect(2,  0 + bob, 4, 3);
  ctx.fillRect(10, 0 + bob, 4, 3);
  ctx.fillRect(0, 3 + bob, 16, 9);
  const lA = wf, lB = 1 - wf;
  ctx.fillRect(1,  12, 3, 4 + lA);
  ctx.fillRect(7,  12, 2, 4 + lB);
  ctx.fillRect(12, 12, 3, 4 + lA);
  ctx.fillRect(0,  15 + lA, 5, 2);
  ctx.fillRect(6,  15 + lB, 4, 2);
  ctx.fillRect(11, 15 + lA, 5, 2);
  ctx.fillStyle = T;
  ctx.fillRect(2,  5 + bob, 3, 3);
  ctx.fillRect(11, 5 + bob, 3, 3);
  ctx.restore();
}

function drawBlock(ctx, bx, by, bw, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(bx + 2, by + BLOCK_H, bw - 2, 3);
  ctx.fillStyle = "#112240";
  ctx.fillRect(bx, by, bw, BLOCK_H);
  ctx.fillStyle = "rgba(100,255,218,0.6)";
  ctx.fillRect(bx, by, bw, 2);
  ctx.fillStyle = "rgba(100,255,218,0.09)";
  for (let px = bx + 6; px < bx + bw - 3; px += 10)
    ctx.fillRect(px, by + 3, 2, 2);
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(bx, by + BLOCK_H - 1, bw, 1);
  ctx.restore();
}

function drawGoalBlock(ctx, bx, by, bw, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const pulse = 0.55 + 0.45 * Math.sin(Date.now() * 0.003);
  ctx.fillStyle = `rgba(255,215,0,${0.07 * pulse})`;
  ctx.fillRect(bx - 4, by - 4, bw + 8, BLOCK_H + 8);
  ctx.fillStyle = "rgba(140,100,0,0.14)";
  ctx.fillRect(bx + 2, by + BLOCK_H, bw - 2, 3);
  ctx.fillStyle = "#191200";
  ctx.fillRect(bx, by, bw, BLOCK_H);
  ctx.fillStyle = `rgba(255,215,0,${0.78 * pulse})`;
  ctx.fillRect(bx, by, bw, 2);
  ctx.fillStyle = "rgba(255,215,0,0.16)";
  for (let px = bx + 5; px < bx + bw - 2; px += 7)
    ctx.fillRect(px, by + 3, 2, 2);
  ctx.fillStyle = `rgba(255,215,0,${0.38 * pulse})`;
  ctx.fillRect(bx, by + BLOCK_H - 1, bw, 1);
  ctx.restore();
}

const PLATFORM_SELECTORS = [
  ".section-title", ".intro-title", ".intro-desc",
  ".intro-contact", ".joblist-job-title", ".joblist-job-company",
  ".joblist-duration", ".job-description", ".card-title", ".ending-credits",
  "h3", "p", "li",
];

function getNavbarBottom() {
  const nb = document.querySelector(".navbar");
  return nb ? nb.getBoundingClientRect().bottom : 60;
}

const RobotGame = ({ active }) => {
  const canvasRef    = useRef(null);
  const animRef      = useRef(null);
  const alienRef     = useRef(null);
  const blocksRef    = useRef([]);
  const keysRef      = useRef(new Set());
  const jumpLatchRef = useRef(false);
  const frameRef     = useRef(0);

  const [gameStatus, setGameStatus] = useState("playing");
  const [restartKey, setRestartKey] = useState(0);

  const restart = useCallback(() => setRestartKey((k) => k + 1), []);

  const getPlatforms = useCallback(() => {
    const scrollY = window.scrollY;
    const platforms = blocksRef.current
      .filter((b) => b.alpha > 0.5)
      .map((b) => ({ x: b.x, y: b.docY, w: b.w }));
    PLATFORM_SELECTORS.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 60) return;
        const docTop = r.top + scrollY;
        if (docTop > scrollY + window.innerHeight + 200 || docTop + r.height < scrollY - 200) return;
        platforms.push({ x: r.left, y: docTop, w: r.width });
      });
    });
    return platforms;
  }, []);

  useEffect(() => {
    if (!active) { cancelAnimationFrame(animRef.current); return; }

    window.scrollTo(0, 0);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const nb = getNavbarBottom();
    frameRef.current = 0;

    const textZones = [];
    PLATFORM_SELECTORS.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 60 || r.height < 4 || r.height > 55) return;
        textZones.push({ top: r.top - 4, bot: r.bottom + 4 });
      });
    });
    const adjustForText = (docY) => {
      let y = docY;
      for (let i = 0; i < 4; i++) {
        const hit = textZones.find((z) => y < z.bot && y + BLOCK_H > z.top);
        if (!hit) break;
        y = hit.bot + 5;
      }
      return y;
    };

    const credEl   = document.querySelector(".ending-credits");
    const credDocY = credEl
      ? credEl.getBoundingClientRect().top + window.scrollY
      : nb + 5400;
    const goalDocY = Math.max(credDocY - 20, nb + 3000);
    const goalX    = 200;
    const goalW    = 200;

    const ap1DocY = goalDocY - 400;
    const ap2DocY = goalDocY - 195;

    const mkS = (b) => ({ ...b, isSpawn: false, isGoal: false, alpha: 0, revealed: false });

    const rawScatter = [
      { x: 20,  docY: nb + 320  }, { x: 120, docY: nb + 355  },
      { x: 200, docY: nb + 570  }, { x: 110, docY: nb + 605  }, { x: 20,  docY: nb + 640  },
      { x: 20,  docY: nb + 850  }, { x: 120, docY: nb + 885  },
      { x: 210, docY: nb + 1100 }, { x: 110, docY: nb + 1135 }, { x: 20,  docY: nb + 1170 },
      { x: 20,  docY: nb + 1380 }, { x: 130, docY: nb + 1415 },
      { x: 200, docY: nb + 1640 }, { x: 110, docY: nb + 1675 }, { x: 20,  docY: nb + 1710 },
      { x: 20,  docY: nb + 1920 }, { x: 120, docY: nb + 1955 },
      { x: 210, docY: nb + 2180 }, { x: 110, docY: nb + 2215 }, { x: 20,  docY: nb + 2250 },
      { x: 20,  docY: nb + 2460 }, { x: 130, docY: nb + 2495 },
      { x: 200, docY: nb + 2720 }, { x: 110, docY: nb + 2755 }, { x: 20,  docY: nb + 2790 },
      { x: 20,  docY: nb + 3000 }, { x: 120, docY: nb + 3035 },
      { x: 210, docY: nb + 3260 }, { x: 110, docY: nb + 3295 }, { x: 20,  docY: nb + 3330 },
      { x: 20,  docY: nb + 3540 }, { x: 130, docY: nb + 3575 },
      { x: 200, docY: nb + 3800 }, { x: 110, docY: nb + 3835 }, { x: 20,  docY: nb + 3870 },
      { x: 20,  docY: nb + 4080 }, { x: 120, docY: nb + 4115 },
      { x: 210, docY: nb + 4340 }, { x: 110, docY: nb + 4375 }, { x: 20,  docY: nb + 4410 },
      { x: 20,  docY: nb + 4620 }, { x: 130, docY: nb + 4655 },
      { x: 200, docY: nb + 4880 }, { x: 110, docY: nb + 4915 }, { x: 20,  docY: nb + 4950 },
    ].map((b) => ({ ...b, w: 72 }));

    const rawApproach = [
      { x: 20,  docY: ap1DocY,      w: 72 },
      { x: 110, docY: ap1DocY + 200, w: 72 },
      { x: 20,  docY: ap2DocY,      w: 72 },
      { x: 110, docY: ap2DocY + 200, w: 72 },
    ];

    blocksRef.current = [
      { x: 30,  docY: nb + 200, w: 80, isSpawn: true, spawnIdx: 0, isGoal: false, alpha: 0, revealed: false },
      { x: 170, docY: nb + 155, w: 76, isSpawn: true, spawnIdx: 1, isGoal: false, alpha: 0, revealed: false },
      { x: 315, docY: nb + 235, w: 76, isSpawn: true, spawnIdx: 2, isGoal: false, alpha: 0, revealed: false },
      { x: 450, docY: nb + 175, w: 76, isSpawn: true, spawnIdx: 3, isGoal: false, alpha: 0, revealed: false },
      ...[...rawScatter, ...rawApproach]
        .map((b) => ({ ...b, docY: adjustForText(b.docY) }))
        .map(mkS),
      { x: goalX, docY: goalDocY, w: goalW, isSpawn: false, isGoal: true, alpha: 0, revealed: false },
    ];

    const b0 = blocksRef.current[0];
    alienRef.current = {
      x:        Math.round(b0.x + b0.w / 2 - ALIEN_W / 2),
      docY:     b0.docY - ALIEN_H - 280,
      vx:       0,
      vy:       0,
      onGround: false,
      frame:    0,
      status:   "playing",
      spawning: true,
      bounces:  0,
    };

    setGameStatus("playing");

    const onKeyDown = (e) => {
      if (e.code === "Space" && alienRef.current?.status === "dead") {
        restart();
        return;
      }
      keysRef.current.add(e.code);
      if (["Space","ArrowUp","ArrowLeft","ArrowRight","ArrowDown"].includes(e.code))
        e.preventDefault();
    };
    const onKeyUp = (e) => keysRef.current.delete(e.code);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);

    const loop = () => {
      const a = alienRef.current;
      if (!a || a.status !== "playing") return;

      if (canvas.width  !== window.innerWidth)  canvas.width  = window.innerWidth;
      if (canvas.height !== window.innerHeight) canvas.height = window.innerHeight;

      const scrollY = window.scrollY;
      frameRef.current++;

      // Reveal + fade-in
      blocksRef.current.forEach((b) => {
        if (!b.revealed) {
          if (b.isSpawn) {
            if (frameRef.current >= b.spawnIdx * SPAWN_INTERVAL) b.revealed = true;
          } else {
            if (b.docY - scrollY < canvas.height + 80) b.revealed = true;
          }
        }
        if (b.revealed && b.alpha < 0.62) b.alpha = Math.min(b.alpha + 0.05, 0.62);
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      blocksRef.current.forEach((b) => {
        if (b.alpha <= 0) return;
        const sy = b.docY - scrollY;
        if (sy > -BLOCK_H - 4 && sy < canvas.height + 4) {
          if (b.isGoal) drawGoalBlock(ctx, b.x, sy, b.w, b.alpha);
          else          drawBlock(ctx, b.x, sy, b.w, b.alpha);
        }
      });

      /* ── Spawn fall animation ── */
      if (a.spawning) {
        a.vy = Math.min(a.vy + GRAVITY, 8);
        a.docY += a.vy;
        a.frame++;

        const b = blocksRef.current[0];
        if (b.alpha > 0.5) {
          const rBot = a.docY + ALIEN_H, prev = rBot - a.vy;
          if (a.x + ALIEN_W > b.x && a.x < b.x + b.w &&
              prev <= b.docY + 4 && rBot >= b.docY && a.vy > 0) {
            a.docY = b.docY - ALIEN_H;
            a.bounces++;
            if      (a.bounces === 1) { a.vy = -4.5; }
            else if (a.bounces === 2) { a.vy = -1.8; }
            else    { a.vy = 0; a.onGround = true; a.spawning = false; }
          }
        }

        const sy = a.docY - scrollY;
        if (sy > -ALIEN_H && sy < canvas.height)
          drawAlien(ctx, a.x, sy, a.frame, a.onGround, false);
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      /* ── Normal gameplay ── */
      const keys  = keysRef.current;
      const left  = keys.has("ArrowLeft")  || keys.has("KeyA");
      const right = keys.has("ArrowRight") || keys.has("KeyD");
      const jump  = keys.has("Space") || keys.has("ArrowUp") || keys.has("KeyW");

      if (left)       a.vx = Math.max(a.vx - 0.32, -MAX_SPEED);
      else if (right) a.vx = Math.min(a.vx + 0.32,  MAX_SPEED);
      else            a.vx *= FRICTION;

      if (jump && a.onGround && !jumpLatchRef.current) {
        a.vy = JUMP_FORCE; a.onGround = false; jumpLatchRef.current = true;
      }
      if (!jump) jumpLatchRef.current = false;

      a.vy = Math.min(a.vy + GRAVITY, 8);
      a.x += a.vx;
      a.docY += a.vy;
      a.frame++;

      if (a.x < 0)                       { a.x = 0;                       a.vx = 0; }
      if (a.x + ALIEN_W > canvas.width)  { a.x = canvas.width - ALIEN_W;  a.vx = 0; }

      const platforms = getPlatforms();
      a.onGround = false;
      for (const p of platforms) {
        const rBot = a.docY + ALIEN_H, prev = rBot - a.vy;
        if (a.x + ALIEN_W > p.x + 2 && a.x < p.x + p.w - 2 &&
            prev <= p.y + 5 && rBot >= p.y - 1 && a.vy >= 0) {
          a.docY = p.y - ALIEN_H; a.vy = 0; a.onGround = true; break;
        }
      }

      if (a.docY - scrollY > canvas.height + 100) {
        a.status = "dead"; setGameStatus("dead"); return;
      }

      // Win when touching goal block
      const goalB = blocksRef.current.find((b) => b.isGoal && b.alpha > 0.3);
      if (goalB) {
        const rBot = a.docY + ALIEN_H;
        if (a.x + ALIEN_W > goalB.x + 2 && a.x < goalB.x + goalB.w - 2 &&
            rBot >= goalB.docY - 1 && rBot <= goalB.docY + BLOCK_H + 2) {
          a.status = "won"; setGameStatus("won"); return;
        }
      }

      const sy = a.docY - scrollY;
      const isIdle = a.onGround && Math.abs(a.vx) < 0.25;
      if (sy > -ALIEN_H && sy < canvas.height + 40)
        drawAlien(ctx, a.x, sy, a.frame, a.onGround, isIdle);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    const onResize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup",   onKeyUp);
      window.removeEventListener("resize",  onResize);
      keysRef.current.clear();
      jumpLatchRef.current = false;
    };
  }, [active, restartKey, getPlatforms, restart]);

  if (!active) return null;

  return (
    <>
      <canvas ref={canvasRef} className="robot-game-canvas" />

      {gameStatus === "dead" && (
        <div className="robot-game-status robot-game-status--dead">
          <div className="robot-game-status-title">you fell</div>
          <div className="robot-game-status-sub">the void claims another</div>
          <button className="robot-game-status-btn" onClick={restart}>try again</button>
          <div className="robot-game-status-hint">or press space</div>
        </div>
      )}

      {gameStatus === "won" && (
        <div className="robot-game-status robot-game-status--won">
          <div className="robot-game-status-title">you made it!</div>
          <div className="robot-game-status-sub">all the way to the bottom</div>
          <button className="robot-game-status-btn" onClick={restart}>play again</button>
        </div>
      )}
    </>
  );
};

export default RobotGame;
