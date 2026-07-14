import React, { useEffect } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import "../styles/PdfViewerModal.css";

// Reusable full-screen PDF viewer overlay, used for the resume and for
// certificates. Mirrors the original resume markup from Intro.jsx, with
// Escape-to-close and body scroll locking added.
//
// Props:
//   title   - text for the iframe title (a11y) and the toolbar label
//   src     - PDF URL
//   onClose - called when the overlay is dismissed
const PdfViewerModal = ({ title, src, onClose }) => {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div
      className="pdf-viewer-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="pdf-viewer-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pdf-viewer-bar">
          <span className="pdf-viewer-bar-title">{title}</span>
          <button
            className="pdf-viewer-close"
            type="button"
            onClick={onClose}
            aria-label={`Close ${title} viewer`}
          >
            <CloseRoundedIcon />
          </button>
        </div>
        <iframe title={title} src={src} className="pdf-viewer-frame" />
      </div>
    </div>
  );
};

export default PdfViewerModal;
