import React, { useState } from "react";
import "../styles/Intro.css";
import { TypeAnimation } from "react-type-animation";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import FadeInSection from "./FadeInSection";
import AsciiPortrait from "./AsciiPortrait";
import PdfViewerModal from "./PdfViewerModal";
import { portfolio } from "../data/portfolio";

const { profile, links } = portfolio;

const Intro = () => {
  const [showResume, setShowResume] = useState(false);

  return (
    <div id="intro">
      <div className="intro-simulation">
        <AsciiPortrait />
      </div>
      <div className="intro-block">
        <div className="intro-title">
          {profile.greeting.before}
          <span className="intro-name">
            <TypeAnimation sequence={[profile.greeting.name]} wrapper="span" cursor={false} repeat={0} />
          </span>
          {profile.greeting.after}
          <span className="intro-cursor">|</span>
        </div>
        <FadeInSection>
          <div className="intro-desc">{profile.summary}</div>
          <div className="intro-actions">
            <a href={links.email} className="intro-contact">
              <EmailRoundedIcon />
              {" Say hi!"}
            </a>
            <button
              type="button"
              className="intro-contact intro-contact--button"
              onClick={() => setShowResume(true)}
            >
              <ArticleRoundedIcon />
              Resume
            </button>
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
