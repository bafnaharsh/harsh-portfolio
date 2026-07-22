import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../styles/Projects.css";
import "../styles/Certificates.css";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import CrisisAlertRoundedIcon from "@mui/icons-material/CrisisAlertRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import FadeInSection from "./FadeInSection";
import PdfViewerModal from "./PdfViewerModal";
import { certificates } from "../data/certificates";

const projects = [
  {
    title: "RCA, Segmentation & NL2SQL Bot",
    company: "Quantiphi",
    desc: "Production multi-agent analytics platform that lets business users query structured enterprise data through natural-language chat.",
    techStack: "Python, SQL, Google ADK, LLMs, RAG, AI Agents",
    icon: StorageRoundedIcon,
  },
  {
    title: "AI Search & Recommendation Engine",
    company: "Quantiphi",
    desc: "Conversational product discovery system over an 80K+ SKU catalog, combining Vertex AI Search with recommendation models.",
    techStack: "Python, Vertex AI Search, LLMs, Ranking",
    icon: TravelExploreRoundedIcon,
  },
  {
    title: "AI Email Campaign Generator",
    company: "Quantiphi",
    desc: "AI workflow that scrapes property themes and metadata, then generates polished marketing emails with enhanced imagery.",
    techStack: "Python, LLMs, Web Scraping, NLP, Imagen",
    icon: MarkEmailReadRoundedIcon,
  },
  {
    title: "Lead Hotspot Detection",
    company: "Quantiphi",
    desc: "Hybrid ML and rules-based system for predicting lead-contamination hotspots from SDWIS public water system data.",
    techStack: "Python, LangChain, LLMs, EDA, Feature Engineering",
    icon: CrisisAlertRoundedIcon,
  },
  {
    title: "Real-Time Market Visualization",
    company: "JP Morgan Chase & Co.",
    desc: "Streaming interface and live graphing workflow for monitoring historical stock-correlation behavior at high throughput.",
    techStack: "Perspective, Real-Time Data Streaming, Visualization",
    icon: ShowChartRoundedIcon,
  },
];

// Largest number of cards that can ever be shown side by side. Arrows are
// only rendered when there are more projects than this.
const MAX_VISIBLE = 3;

// Returns how many cards fit the current viewport. Kept in sync with the CSS
// breakpoints in Projects.css.
const useVisibleCount = () => {
  const getCount = () => {
    if (typeof window === "undefined") return MAX_VISIBLE;
    if (window.matchMedia("(max-width: 768px)").matches) return 1;
    if (window.matchMedia("(max-width: 1080px)").matches) return 2;
    return MAX_VISIBLE;
  };

  const [count, setCount] = useState(getCount);

  useEffect(() => {
    const mqlWide = window.matchMedia("(max-width: 1080px)");
    const mqlNarrow = window.matchMedia("(max-width: 768px)");
    const handler = () => setCount(getCount());
    mqlWide.addEventListener("change", handler);
    mqlNarrow.addEventListener("change", handler);
    return () => {
      mqlWide.removeEventListener("change", handler);
      mqlNarrow.removeEventListener("change", handler);
    };
  }, []);

  return count;
};

const Projects = () => {
  const visibleCount = useVisibleCount();
  const [index, setIndex] = useState(0);
  const [activeCert, setActiveCert] = useState(null);
  const canSlide = projects.length > visibleCount;

  // Furthest the first visible card can go without revealing empty space.
  const maxIndex = Math.max(0, projects.length - visibleCount);

    // Clamp at render time so a viewport resize can never leave us showing
  // empty space at the end of the track. `index` itself is only ever changed
  // by move()/goTo(), which already clamp to [0, maxIndex].
  const clampedIndex = Math.min(index, maxIndex);

  // Total number of "pages" (dots) available for the current viewport.
  const pageCount = maxIndex + 1;

  const goTo = useCallback(
    (target) => setIndex(Math.max(0, Math.min(maxIndex, target))),
    [maxIndex]
  );

  // Step by `direction` cards. Wraps around the ends so the arrows always do
  // something, which feels more alive than a hard disabled stop.
  const move = useCallback(
    (direction) => {
      setIndex((current) => {
        const next = current + direction;
        if (next < 0) return maxIndex;
        if (next > maxIndex) return 0;
        return next;
      });
    },
    [maxIndex]
  );

  // Slide percentage is expressed in track units (100% of the track), so each
  // step moves exactly one card width regardless of visibleCount.
  const slideStyle = useMemo(
    () => ({ transform: `translateX(-${clampedIndex * (100 / visibleCount)}%)` }),
    [clampedIndex, visibleCount]
  );

  // ----- Keyboard navigation (when the carousel region is focused) ---------
  const onKeyDown = (event) => {
    if (!canSlide) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  };

  // ----- Touch / pointer swipe support ------------------------------------
  const dragRef = useRef({ startX: 0, active: false });

  const onPointerDown = (event) => {
    if (!canSlide) return;
    dragRef.current = { startX: event.clientX, active: true };
  };

  const onPointerUp = (event) => {
    if (!dragRef.current.active) return;
    const deltaX = event.clientX - dragRef.current.startX;
    dragRef.current.active = false;
    const SWIPE_THRESHOLD = 45;
    if (deltaX <= -SWIPE_THRESHOLD) move(1);
    else if (deltaX >= SWIPE_THRESHOLD) move(-1);
  };

  return (
    <div id="projects">
            <div className="section-header">
        <span className="section-title">/ software &amp; certifications</span>
      </div>
      <div className="project-container">
        <div
          className="projects-carousel-shell"
          role="group"
          aria-roledescription="carousel"
          aria-label="Software projects"
          tabIndex={canSlide ? 0 : -1}
          onKeyDown={onKeyDown}
        >
          {canSlide && (
            <button
              className="projects-carousel-btn projects-carousel-btn--prev"
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous projects"
            >
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18 }} />
            </button>
          )}

          <div
            className="projects-carousel-viewport"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <ul
              className="projects-grid projects-grid--carousel"
              style={{
                ...slideStyle,
                "--visible-count": visibleCount,
                "--card-count": projects.length,
              }}
            >
              {projects.map((project, i) => {
                const ProjectIcon = project.icon;
                const isVisible =
                  i >= clampedIndex && i < clampedIndex + visibleCount;
                return (
                  <li
                    className={`projects-card${isVisible ? " projects-card--active" : ""}`}
                    key={project.title}
                    aria-hidden={canSlide && !isVisible ? "true" : undefined}
                  >
                    <FadeInSection delay={(i + 1) * 100 + "ms"}>
                      <div className="card-header">
                        <div className="project-icon">
                          <ProjectIcon sx={{ fontSize: 35 }} />
                        </div>
                        <div className="project-company">{project.company}</div>
                      </div>

                      <div className="card-title">{project.title}</div>
                      <div className="card-desc">{project.desc}</div>
                      <div className="card-tech">{project.techStack}</div>
                    </FadeInSection>
                  </li>
                );
              })}
            </ul>
          </div>

          {canSlide && (
            <button
              className="projects-carousel-btn projects-carousel-btn--next"
              type="button"
              onClick={() => move(1)}
              aria-label="Next projects"
            >
              <ArrowForwardIosRoundedIcon sx={{ fontSize: 18 }} />
            </button>
          )}
        </div>

        {canSlide && (
          <div className="projects-carousel-nav">
            <div
              className="projects-carousel-dots"
              role="tablist"
              aria-label="Choose slide"
            >
              {Array.from({ length: pageCount }, (_, page) => (
                <button
                  key={page}
                  type="button"
                  role="tab"
                  aria-selected={page === clampedIndex}
                  aria-label={`Go to slide ${page + 1} of ${pageCount}`}
                  className={`projects-carousel-dot${
                    page === clampedIndex ? " projects-carousel-dot--active" : ""
                  }`}
                  onClick={() => goTo(page)}
                />
              ))}
            </div>
            <span className="projects-carousel-count">
              {clampedIndex + 1} / {pageCount}
            </span>
          </div>
        )}
      </div>

      <FadeInSection>
        <div className="cert-block">
          <div className="cert-block-label">certifications</div>
          <div className="cert-pills">
            {certificates
              .filter((cert) => cert.slug !== "jp-morgan-forage-internship")
              .map((cert) => {
                const CertIcon = cert.icon;
                return (
                  <button
                    key={cert.slug}
                    type="button"
                    className="cert-pill"
                    onClick={() => setActiveCert(cert)}
                    title={`View ${cert.title} certificate`}
                  >
                  <span className="cert-pill-icon">
                    <CertIcon sx={{ fontSize: 18 }} />
                  </span>
                  <span className="cert-pill-name">{cert.title}</span>
                  <span className="cert-pill-issuer">{cert.issuer}</span>
                  <span className="cert-pill-arrow">
                    <NorthEastRoundedIcon sx={{ fontSize: 15 }} />
                  </span>
                  </button>
                );
              })}
          </div>
        </div>
      </FadeInSection>

      {activeCert && (
        <PdfViewerModal
          title={`${activeCert.title} — ${activeCert.issuer}`}
          src={activeCert.file}
          shareUrl={`${window.location.origin}/certificate/${activeCert.slug}`}
          onClose={() => setActiveCert(null)}
        />
      )}
    </div>
  );
};

export default Projects;
