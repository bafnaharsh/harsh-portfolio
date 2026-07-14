import React from "react";
import { Link } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import FadeInSection from "./FadeInSection";
import "../styles/ArtGallery.css";
import "../styles/Certificates.css";

// Resume source, kept in one place so the homepage button and this page stay
// in sync. Mirrors how certificates.js centralizes cert metadata.
const RESUME_FILE = "/HarshBafna.pdf";

// Standalone, shareable resume page at /resume. Renders the full PDF inline
// (fit-to-page) plus a back link to the home page. Mirrors the /cert/:slug
// page so resume and certificates are presented the same way.
const ResumeViewer = () => (
  <div className="cert-page">
    <div className="section-header">
      <Link to="/" className="back-button">
        <ArrowBackRoundedIcon />
      </Link>
      <span className="section-title">/ resume</span>
    </div>

    <FadeInSection>
      <div className="cert-page-head">
        <span className="cert-page-icon">
          <ArticleRoundedIcon />
        </span>
        <div className="cert-page-meta">
          <h1 className="cert-page-title">Resume</h1>
          <span className="cert-page-issuer">Harsh Bafna</span>
        </div>
        <a
          className="cert-page-open"
          href={RESUME_FILE}
          target="_blank"
          rel="noopener noreferrer"
        >
          <OpenInNewRoundedIcon sx={{ fontSize: 18 }} />
          Open PDF
        </a>
      </div>
    </FadeInSection>

    <FadeInSection delay="150ms">
      <div className="cert-page-frame-wrap">
        <iframe
          title="Harsh Bafna resume"
          src={`${RESUME_FILE}#view=FitH`}
          className="cert-page-frame"
        />
      </div>
    </FadeInSection>
  </div>
);

export default ResumeViewer;
