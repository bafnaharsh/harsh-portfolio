import React from "react";
import { Link, useParams } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import FadeInSection from "./FadeInSection";
import "../styles/ArtGallery.css";
import "../styles/Certificates.css";
import { getCertificateBySlug, certificates } from "../data/certificates";

// Standalone, shareable certificate page at /certificate/:slug. Renders the full PDF
// inline (like the resume) plus a back link to the home page. Direct links
// (e.g. https://<site>/certificate/google-cloud-engineer) work because of the SPA
// fallback in public/_redirects.
const CertificateViewer = () => {
  const { slug } = useParams();
  const cert = getCertificateBySlug(slug);

  if (!cert) {
    return (
      <div className="cert-page">
        <div className="section-header">
          <Link to="/#projects" className="back-button">
            <ArrowBackRoundedIcon />
          </Link>
          <span className="section-title">/ certificate not found</span>
        </div>
        <FadeInSection>
          <p className="cert-not-found">
            This certificate link isn&apos;t valid.
          </p>
          <Link to="/#projects" className="cert-back-link">
            ← Back to certifications
          </Link>
        </FadeInSection>
      </div>
    );
  }

  const CertIcon = cert.icon;

  return (
    <div className="cert-page">
      <div className="section-header">
        <Link to="/#projects" className="back-button">
          <ArrowBackRoundedIcon />
        </Link>
        <span className="section-title">/ {cert.title.toLowerCase()}</span>
      </div>

      <FadeInSection>
        <div className="cert-page-head">
          <span className="cert-page-icon">
            <CertIcon />
          </span>
          <div className="cert-page-meta">
            <h1 className="cert-page-title">{cert.title}</h1>
            <span className="cert-page-issuer">{cert.issuer}</span>
          </div>
          <a
            className="cert-page-open"
            href={cert.file}
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
            title={`${cert.title} certificate`}
            src={`${cert.file}#view=FitH`}
            className="cert-page-frame"
          />
        </div>
      </FadeInSection>

      <FadeInSection delay="250ms">
        <div className="cert-page-others">
          <span className="cert-page-others-label">other certificates</span>
          <div className="cert-page-others-list">
            {certificates
              .filter((c) => c.slug !== cert.slug)
              .map((c) => (
                <Link
                  key={c.slug}
                  to={`/certificate/${c.slug}`}
                  className="cert-page-other-pill"
                >
                  {c.title}
                </Link>
              ))}
          </div>
        </div>
      </FadeInSection>
    </div>
  );
};

export default CertificateViewer;
