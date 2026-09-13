import React, { useEffect, useState } from "react";
import "../styles/ScrollProgress.css";

// Thin bar pinned to the very top of the viewport that fills left-to-right as
// the visitor scrolls through the page.
const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      // Quantise to 0.25% so a scroll that barely moves does not re-render
      // (React bails out when the value is unchanged). 0.25% of a 1280px bar
      // is ~3px, below what the eye reads as stepping.
      const quantised = Math.round(Math.min(100, Math.max(0, pct)) * 4) / 4;
      setProgress((prev) => (prev === quantised ? prev : quantised));
    };

    // Coalesce scroll events into one rAF-driven state update per frame.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div
        className="scroll-progress-bar"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
};

export default ScrollProgress;
