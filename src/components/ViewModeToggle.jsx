import React, { useRef } from "react";
import { VIEW_AGENT, VIEW_HUMAN } from "../hooks/useViewMode";
import "../styles/ViewModeToggle.css";

const OPTIONS = [
  { value: VIEW_HUMAN, label: "Human" },
  { value: VIEW_AGENT, label: "Agent" },
];

// Fixed pill, bottom-centre. A radiogroup: arrow keys move, Enter/Space select.
// `hidden` is used while game mode owns the keyboard and the viewport.
const ViewModeToggle = ({ view, onChange, hidden = false }) => {
  const buttonRefs = useRef([]);
  const activeIndex = OPTIONS.findIndex((o) => o.value === view);

  const select = (index) => {
    const next = OPTIONS[(index + OPTIONS.length) % OPTIONS.length];
    if (next.value !== view) onChange(next.value);
    buttonRefs.current[OPTIONS.indexOf(next)]?.focus();
  };

  const onKeyDown = (event) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        select(activeIndex + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        select(activeIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        select(0);
        break;
      case "End":
        event.preventDefault();
        select(OPTIONS.length - 1);
        break;
      default:
    }
  };

  return (
    <div
      className={`view-toggle${hidden ? " view-toggle--hidden" : ""}`}
      data-view-toggle
      data-view={view}
      aria-hidden={hidden ? "true" : undefined}
    >
      <div
        className="view-toggle-group"
        role="radiogroup"
        aria-label="Content view mode"
        onKeyDown={onKeyDown}
      >
        <span className="view-toggle-indicator" aria-hidden="true" />
        {OPTIONS.map((option, i) => {
          const checked = option.value === view;
          return (
            <button
              key={option.value}
              ref={(el) => (buttonRefs.current[i] = el)}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              className={`view-toggle-option${checked ? " view-toggle-option--active" : ""}`}
              onClick={() => select(i)}
              disabled={hidden}
            >
              <span className="view-toggle-dot" aria-hidden="true" />
              <span className="view-toggle-label">{option.label}</span>
            </button>
          );
        })}
      </div>
      <span className="view-toggle-live" aria-live="polite">
        {view === VIEW_AGENT ? "Agent view: markdown profile" : "Human view"}
      </span>
    </div>
  );
};

export default ViewModeToggle;
