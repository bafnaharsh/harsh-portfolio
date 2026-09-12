import React from "react";
import { Link } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import FadeInSection from "./FadeInSection";
import "../styles/ArtGallery.css";
import "../styles/Certificates.css";
import { portfolio } from "../data/portfolio";

// Resume source comes from the single source of truth so the homepage button
// and this page can never drift apart.
const RESUME_FILE = portfolio.links.resume;

// Standalone, shareable resume page at /resume. Renders the full PDF inline
// (fit-to-page) plus a back link to the home page. Mirrors the /cert/:slug
// page so resume and certificates are presented the same way.
const ResumeViewer = () => (
  <div className="cert-page">
    <div className="section-header">
      <Link to="/" className="back-button" aria-label="Back to home">
        <ArrowBackRoundedIcon />
      </Link>
      <p className="section-title">/ resume</p>
    </div>

    <FadeInSection>
      <div className="cert-page-head">
        <span className="cert-page-icon">
          <ArticleRoundedIcon />
        </span>
        <div className="cert-page-meta">
          <h1 className="cert-page-title">Resume</h1>
          <span className="cert-page-issuer">{portfolio.profile.name}</span>
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
          title={`${portfolio.profile.name} resume`}
          src={`${RESUME_FILE}#view=FitH`}
          className="cert-page-frame"
        />
      </div>
    </FadeInSection>
  </div>
);

export default ResumeViewer;
