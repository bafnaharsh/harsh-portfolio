import React from "react";
import "../styles/About.css";
import FadeInSection from "./FadeInSection";
import { portfolio } from "../data/portfolio";

const { about, profile } = portfolio;

// Renders one paragraph's segments, reproducing the original inline markup:
// bold spans become <b>, linked spans become <a>.
const Paragraph = ({ segments }) => (
  <p>
    {segments.map((seg, i) => {
      if (seg.href) {
        return (
          <a key={i} href={seg.href}>
            {seg.text}
          </a>
        );
      }
      if (seg.bold) return <b key={i}>{seg.text}</b>;
      return <React.Fragment key={i}>{seg.text}</React.Fragment>;
    })}
  </p>
);

const About = () => {
  const [one, two] = about.paragraphs;

  return (
    <div id="about">
            <FadeInSection>
        <div className="section-header">
          <span className="section-title">/ about me</span>
        </div>
        <div className="about-content">
          <div className="about-description">
            <Paragraph segments={one} />
            {about.techIntro}
            <ul className="tech-stack">
              {about.techStack.map((techItem, i) => (
                <FadeInSection key={i} delay={(i + 1) * 100 + "ms"}>
                  <li>{techItem}</li>
                </FadeInSection>
              ))}
            </ul>
            <Paragraph segments={two} />
          </div>
          <div className="about-image">
            <img alt={profile.aboutImageAlt} src={profile.aboutImage} />
          </div>
        </div>
      </FadeInSection>
    </div>
  );
};

export default About;
