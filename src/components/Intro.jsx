import React, { useState } from "react";
import "../styles/Intro.css";
import { TypeAnimation } from "react-type-animation";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import FadeInSection from "./FadeInSection";
import AsciiPortrait from "./AsciiPortrait";
import PdfViewerModal from "./PdfViewerModal";
import HoverPreview from "./HoverPreview";
import { portfolio } from "../data/portfolio";

const { profile, links } = portfolio;

// Display forms derived from the data — nothing here is hardcoded.
const emailAddress = links.email.replace(/^mailto:/i, "");
// First page of public/HarshBafna.pdf — see scripts/generate-previews.mjs.
const resumeShot = { src: "/previews/resume.webp", width: 396, height: 560 };

const Intro = () => {
  const [showResume, setShowResume] = useState(false);

  return (
    <div id="intro">
      <div className="intro-simulation">
        <AsciiPortrait />
      </div>
      <div className="intro-block">
        <h1 className="intro-title">
          {profile.greeting.before}
          <span className="intro-name">
            <TypeAnimation sequence={[profile.greeting.name]} wrapper="span" cursor={false} repeat={0} />
          </span>
          {profile.greeting.after}
          <span className="intro-cursor" aria-hidden="true">|</span>
        </h1>
        <FadeInSection>
          <div className="intro-desc">{profile.summary}</div>
          <div className="intro-actions">
            <HoverPreview title="Email" detail={emailAddress} hint="opens your mail app" placement="top">
              <a href={links.email} className="intro-contact">
                <EmailRoundedIcon />
                {" Say hi!"}
              </a>
            </HoverPreview>
            <HoverPreview
              title="Resume"
              detail="PDF · opens in a viewer here"
              image={resumeShot}
              placement="top"
            >
              <button
                type="button"
                className="intro-contact intro-contact--button"
                onClick={() => setShowResume(true)}
              >
                <ArticleRoundedIcon />
                Resume
              </button>
            </HoverPreview>
          </div>
        </FadeInSection>
        {showResume && (
          <PdfViewerModal
            title={`Resume — ${profile.name}`}
            src={links.resume}
            shareUrl={`${window.location.origin}/resume`}
            onClose={() => setShowResume(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Intro;
