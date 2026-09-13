import React, { useCallback, useEffect, useRef, useState } from "react";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import "../styles/BackToTop.css";

// How long the "sent" flourish (arrow swap + ring pulse) runs for, in ms.
// Kept in sync with the --sending animations in BackToTop.css.
const SENT_STATE_MS = 460;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// easeInOutCubic — slow start, quick middle, gentle landing.
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Floating button that appears after the visitor scrolls down a screenful and
// returns them to the top with a cancellable rAF-driven ease.
const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const rafRef = useRef(0);
  const sentTimerRef = useRef(0);
  const detachRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Stop any in-flight animation and release the listeners that watch for the
  // visitor taking control back.
  const stopAnimation = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (detachRef.current) {
      detachRef.current();
      detachRef.current = null;
    }
  }, []);

  const clearSentState = useCallback(() => {
    if (sentTimerRef.current) {
      clearTimeout(sentTimerRef.current);
      sentTimerRef.current = 0;
    }
    setSending(false);
  }, []);

  useEffect(
    () => () => {
      stopAnimation();
      if (sentTimerRef.current) clearTimeout(sentTimerRef.current);
    },
    [stopAnimation]
  );

  const scrollToTop = useCallback(() => {
    const scroller =
      document.scrollingElement || document.documentElement || document.body;

    // The mobile menu pins <body> with position:fixed; undo that first so the
    // document can actually scroll, and never let CSS smooth-scroll interfere.
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    scroller.style.scrollBehavior = "auto";

    // The belt-and-braces reset kept from the original fix: every scroll owner
    // gets zeroed, repeatedly, because a single call used to be dropped when
    // the body had just been un-pinned.
    const resetTop = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      scroller.scrollTop = 0;
      window.scrollTo(0, 0);
      window.scroll({ top: 0, left: 0, behavior: "auto" });
    };

    // Instant path: hammer every scroll owner over ~150ms, because a single
    // call used to be dropped when the body had only just been un-pinned.
    const jumpToTop = () => {
      resetTop();
      requestAnimationFrame(resetTop);
      setTimeout(resetTop, 50);
      setTimeout(resetTop, 150);
    };

    // Animated path: the rAF loop has already been driving the scroller for
    // hundreds of ms, so it is demonstrably live — one reset plus a frame of
    // confirmation lands on exactly 0 without trailing timers that would fight
    // a visitor who starts scrolling again the instant we arrive.
    const landAtTop = () => {
      resetTop();
      requestAnimationFrame(resetTop);
    };

    stopAnimation();

    const start = window.scrollY || scroller.scrollTop || 0;

    if (prefersReducedMotion() || start <= 0) {
      clearSentState();
      jumpToTop();
      return;
    }

    // Duration scales with the distance travelled, clamped to a comfortable
    // 350–900ms so short hops feel snappy and long pages never drag.
    const duration = Math.min(900, Math.max(350, Math.round(start * 0.28)));
    const startTime = performance.now();

    // Hand control straight back the moment the visitor scrolls themselves.
    const cancel = () => {
      stopAnimation();
      clearSentState();
    };
    const events = ["wheel", "touchstart", "touchmove", "keydown"];
    events.forEach((type) =>
      window.addEventListener(type, cancel, { passive: true })
    );
    detachRef.current = () =>
      events.forEach((type) => window.removeEventListener(type, cancel));

    setSending(true);
    if (sentTimerRef.current) clearTimeout(sentTimerRef.current);
    sentTimerRef.current = setTimeout(
      () => setSending(false),
      Math.max(duration, SENT_STATE_MS)
    );

    // What we left the scroll position at on the previous frame, so we can tell
    // our own movement from someone else's. -1 until the first frame has run.
    let expected = -1;

    const step = (now) => {
      // Something other than this animation moved the page since the last frame
      // — game mode's scrollTo(0, 0), a scrollbar drag, an anchor jump. Hand
      // control straight back rather than dragging the viewport back onto our
      // curve, which would otherwise keep scrolling underneath the new owner.
      if (expected >= 0 && Math.abs(window.scrollY - expected) > 2) {
        cancel();
        return;
      }
      const t = Math.min(1, (now - startTime) / duration);
      if (t < 1) {
        window.scrollTo(0, start * (1 - easeInOutCubic(t)));
        expected = window.scrollY; // read back, so clamping/rounding is ours too
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      rafRef.current = 0;
      if (detachRef.current) {
        detachRef.current();
        detachRef.current = null;
      }
      landAtTop(); // land on exactly 0, whatever the sub-pixel rounding did
    };

    rafRef.current = requestAnimationFrame(step);
  }, [clearSentState, stopAnimation]);

  return (
    <button
      type="button"
      className={`back-to-top${visible ? " back-to-top--visible" : ""}${
        sending ? " back-to-top--sending" : ""
      }`}
      onClick={scrollToTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
    >
      <span className="back-to-top__icon" aria-hidden="true">
        <KeyboardArrowUpRoundedIcon className="back-to-top__arrow back-to-top__arrow--lead" />
        <KeyboardArrowUpRoundedIcon className="back-to-top__arrow back-to-top__arrow--trail" />
      </span>
    </button>
  );
};

export default BackToTop;
