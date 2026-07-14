import React, { useEffect, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import "../styles/PdfViewerModal.css";

// Reusable full-screen PDF viewer overlay, used for the resume and for
// certificates. Mirrors the original resume markup from Intro.jsx, with
// Escape-to-close and body scroll locking added.
//
// Props:
//   title    - text for the iframe title (a11y) and the toolbar label
//   src      - PDF URL
//   onClose  - called when the overlay is dismissed
//   shareUrl - absolute URL shown in a copy-to-clipboard row. When provided
//              (e.g. for certificates), the row renders so the viewer can copy
//              the shareable deep link. Omit for non-shareable docs (resume).
const PdfViewerModal = ({ title, src, onClose, shareUrl }) => {
  const [copied, setCopied] = useState(false);

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

  // Reset the "Copied!" feedback each time the modal is opened, so a stale
  // checkmark from a previous view can't linger.
  useEffect(() => {
    setCopied(false);
  }, [shareUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (insecure context). Fall back to a
      // select-and-copy on a hidden input so the link is still reachable.
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* no-op */
      }
      document.body.removeChild(input);
    }
  };

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

        {shareUrl && (
          <div className="pdf-viewer-share">
            <LinkRoundedIcon sx={{ fontSize: 16 }} className="pdf-viewer-share-icon" />
            <span className="pdf-viewer-share-url" title={shareUrl}>
              {shareUrl}
            </span>
            <button
              type="button"
              className="pdf-viewer-share-btn"
              onClick={handleCopy}
              aria-label="Copy shareable link"
            >
              {copied ? (
                <CheckRoundedIcon sx={{ fontSize: 16 }} />
              ) : (
                <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}

        <iframe title={title} src={src} className="pdf-viewer-frame" />
      </div>
    </div>
  );
};

export default PdfViewerModal;
