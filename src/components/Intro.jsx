import React, { useState } from "react";
import "../styles/Intro.css";
import { TypeAnimation } from "react-type-animation";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import FadeInSection from "./FadeInSection";
import AsciiPortrait from "./AsciiPortrait";
import PdfViewerModal from "./PdfViewerModal";

const Intro = () => {
  const [showResume, setShowResume] = useState(false);

  return (
    <div id="intro">
      <div className="intro-simulation">
        <AsciiPortrait />
      </div>
      <div className="intro-block">
        <div className="intro-title">
          {"hi, "}
          <span className="intro-name">
            <TypeAnimation sequence={["harsh"]} wrapper="span" cursor={false} repeat={0} />
          </span>
          {" here."}
          <span className="intro-cursor">|</span>
        </div>
        <FadeInSection>
          <div className="intro-desc">
            Machine learning engineer specializing in generative AI, multi-agent
            systems, and production-grade LLM applications. I build retrieval
            and analytics systems that turn messy enterprise data into useful
            answers.
          </div>
          <div className="intro-actions">
            <a href="mailto:Harshbafna26@gmail.com" className="intro-contact">
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
            title="Resume — Harsh Bafna"
            src="/HarshBafna.pdf"
            shareUrl={`${window.location.origin}/resume`}
            onClose={() => setShowResume(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Intro;
