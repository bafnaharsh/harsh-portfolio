import React from "react";
import "../styles/About.css";
import FadeInSection from "./FadeInSection";

const About = () => {
  const one = (
    <p>
      I am currently a <b>Machine Learning Engineer</b> at
      <a href="https://quantiphi.com/"> Quantiphi</a>, where I build
      generative AI, RAG, and multi-agent systems for production enterprise
      workflows. Previously, I worked with{" "}
      <a href="https://www.jpmorganchase.com/">JP Morgan Chase & Co.</a>
    </p>
  );
  const two = (
    <p>
      I like systems that feel simple on the surface but do serious work
      underneath: retrieval pipelines, natural-language analytics, and AI tools
      that make data easier to use.
    </p>
  );

  const techStack = ["Python", "SQL", "LangChain", "Google ADK", "Vertex AI", "FastAPI"];

  return (
    <div id="about">
            <FadeInSection>
        <div className="section-header">
          <span className="section-title">/ about me</span>
        </div>
        <div className="about-content">
          <div className="about-description">
            {one}
            {"Here are some technologies I have been working with:"}
            <ul className="tech-stack">
              {techStack.map((techItem, i) => (
                <FadeInSection key={i} delay={(i + 1) * 100 + "ms"}>
                  <li>{techItem}</li>
                </FadeInSection>
              ))}
            </ul>
            {two}
          </div>
          <div className="about-image">
            <img alt="Harsh Bafna" src="/assets/about-harsh.webp" />
          </div>
        </div>
      </FadeInSection>
    </div>
  );
};

export default About;
