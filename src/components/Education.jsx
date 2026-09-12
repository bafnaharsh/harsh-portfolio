import React from "react";
import "../styles/Education.css";
import FadeInSection from "./FadeInSection";
import { portfolio } from "../data/portfolio";

// View model derived from the single source of truth.
const educationItems = portfolio.education.map((item) => ({
  school: item.institution,
  location: item.location,
  program: item.qualification,
  detail: item.detail,
  duration: `${item.start} - ${item.end}`,
}));

const Education = () => {
  return (
    <div id="education">
      <div className="section-header">
        <h2 className="section-title">/ education</h2>
      </div>
      <div className="education-list">
        {educationItems.map((item, i) => (
          <FadeInSection key={item.school} delay={(i + 1) * 100 + "ms"}>
            <div className="education-row">
              <div>
                <div className="education-school">{item.school}</div>
                <div className="education-program">{item.program}</div>
                <div className="education-detail">{item.detail}</div>
              </div>
              <div className="education-meta">
                <div>{item.duration}</div>
                <div>{item.location}</div>
              </div>
            </div>
          </FadeInSection>
        ))}
      </div>
    </div>
  );
};

export default Education;
