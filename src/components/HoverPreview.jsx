import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/HoverPreview.css";

// A small "what does this link do" card shown on hover / keyboard focus.
//
// The card is rendered through a portal into <body> and positioned from the
// trigger's bounding rect, so wrapping a control in <HoverPreview> adds no DOM
// around it and cannot change any layout. The trigger element itself is cloned
// (not wrapped), keeping its own classes, icons and handlers untouched.

const OPEN_DELAY = 150; // ms before the card appears
const EDGE = 12; // min gap to the viewport edge
const GAP = 10; // distance between trigger and card
const MAX_WIDTH = 260;

const canHover = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const HoverPreview = ({ title, detail, hint, note, placement = "bottom", children }) => {
  const rawId = useId();
  const id = `hover-preview-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const triggerRef = useRef(null);
  const cardRef = useRef(null);
  const timerRef = useRef(0);
  const [open, setOpen] = useState(false);

  const child = React.Children.only(children);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = 0;
    }
  };

  const hide = useCallback(() => {
    clearTimer();
    setOpen(false);
  }, []);

  const openLater = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(true), OPEN_DELAY);
  }, []);

  const position = useCallback(() => {
    const trigger = triggerRef.current;
    const card = cardRef.current;
    if (!trigger || !card) return;

    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    // Clamp the width first so the measurement below is the final one.
    card.style.maxWidth = `${Math.max(120, Math.min(MAX_WIDTH, vw - EDGE * 2))}px`;

    const t = trigger.getBoundingClientRect();
    const { width: w, height: h } = card.getBoundingClientRect();

    let side = placement === "top" ? "top" : "bottom";
    if (side === "top" && t.top - GAP - h < EDGE && t.bottom + GAP + h <= vh - EDGE) side = "bottom";
    else if (side === "bottom" && t.bottom + GAP + h > vh - EDGE && t.top - GAP - h >= EDGE) side = "top";

    const top = side === "top" ? t.top - GAP - h : t.bottom + GAP;
    const centered = t.left + t.width / 2 - w / 2;
    const left = Math.max(EDGE, Math.min(centered, vw - EDGE - w));
    const caret = Math.max(14, Math.min(t.left + t.width / 2 - left, Math.max(w - 14, 14)));

    card.style.left = `${Math.round(left)}px`;
    card.style.top = `${Math.round(top)}px`;
    card.style.setProperty("--hp-caret", `${Math.round(caret)}px`);
    card.dataset.side = side;
    card.dataset.ready = "true";
  }, [placement]);

  useLayoutEffect(() => {
    if (open) position();
  }, [open, position]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") hide();
    };
    const onScrollOrResize = () => position();
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, hide, position]);

  useEffect(() => clearTimer, []);

  // The trigger is re-created from its own type and props — no wrapper element,
  // no class or style changes — with only handlers and aria-describedby added.
  // Its DOM node is captured from the event, so no ref prop is needed either.
  const Trigger = child.type;
  const props = child.props;

  return (
    <>
      <Trigger
        {...props}
        aria-describedby={open ? id : props["aria-describedby"]}
        onMouseEnter={(event) => {
          // Pointer previews only on real hover devices — a tap must never show one.
          triggerRef.current = event.currentTarget;
          if (canHover()) openLater();
          props.onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          hide();
          props.onMouseLeave?.(event);
        }}
        onFocus={(event) => {
          // Keyboard focus only, so tapping a link on touch does not open the card.
          triggerRef.current = event.currentTarget;
          if (event.target instanceof Element && event.target.matches(":focus-visible")) openLater();
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          hide();
          props.onBlur?.(event);
        }}
        onPointerDown={(event) => {
          hide();
          props.onPointerDown?.(event);
        }}
      />
      {open &&
        createPortal(
          <span className="hover-preview" id={id} role="tooltip" ref={cardRef}>
            <span className="hover-preview-title">{title}</span>
            {detail ? <span className="hover-preview-detail">{detail}</span> : null}
            {hint ? <span className="hover-preview-hint">{hint}</span> : null}
            {note ? <span className="hover-preview-note">{note}</span> : null}
          </span>,
          document.body,
        )}
    </>
  );
};

export default HoverPreview;
