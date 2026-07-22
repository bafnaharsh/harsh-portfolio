import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import "../styles/Lightbox.css";

// Full-screen photo viewer with prev/next navigation. Mirrors PdfViewerModal's
// portal + Escape-to-close + body-scroll-lock pattern.
//
// Props:
//   photos   - array of { src, title }
//   index    - currently shown photo index
//   onClose  - called when the overlay is dismissed
//   onIndex  - called with the next index when navigating (wraps around)
const Lightbox = ({ photos, index, onClose, onIndex }) => {
  const photo = photos[index];
  const hasMultiple = photos.length > 1;

  const goTo = (direction) => {
    const next = (index + direction + photos.length) % photos.length;
    onIndex(next);
  };

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight" && hasMultiple) goTo(1);
      else if (event.key === "ArrowLeft" && hasMultiple) goTo(-1);
    };
    document.addEventListener("keydown", handleKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = overflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, hasMultiple, onClose]);

  if (!photo) return null;

  const viewer = (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={photo.title}
    >
      <button
        className="lightbox-close"
        type="button"
        onClick={onClose}
        aria-label="Close photo viewer"
      >
        <CloseRoundedIcon />
      </button>

      {hasMultiple && (
        <button
          className="lightbox-nav lightbox-nav--prev"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            goTo(-1);
          }}
          aria-label="Previous photo"
        >
          <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20 }} />
        </button>
      )}

      <figure
        className="lightbox-figure"
        onClick={(event) => event.stopPropagation()}
      >
        <img src={photo.src} alt={photo.title} className="lightbox-image" />
        <figcaption className="lightbox-caption">
          <span>{photo.title}</span>
          {hasMultiple && (
            <span className="lightbox-count">
              {index + 1} / {photos.length}
            </span>
          )}
        </figcaption>
      </figure>

      {hasMultiple && (
        <button
          className="lightbox-nav lightbox-nav--next"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            goTo(1);
          }}
          aria-label="Next photo"
        >
          <ArrowForwardIosRoundedIcon sx={{ fontSize: 20 }} />
        </button>
      )}
    </div>
  );

  return createPortal(viewer, document.body);
};

export default Lightbox;
