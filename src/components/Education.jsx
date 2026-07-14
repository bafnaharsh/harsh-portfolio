import React from "react";
import "../styles/Education.css";
import FadeInSection from "./FadeInSection";

const educationItems = [
  {
    school: "B.M.S. College of Engineering",
    location: "Bangalore, India",
    program: "Bachelor of Engineering, Electronics & Instrumentation Engineering",
    detail: "GPA: 8.3/10",
    duration: "2020 - 2024",
  },
  {
    school: "S.Tech IT School",
    location: "Rajasthan, India",
    program: "Higher Secondary School Certificate, PCM",
    detail: "Percentage: 82.6%",
    duration: "2019 - 2020",
  },
];

const Education = () => {
  return (
    <div id="education">
      <div className="section-header">
        <span className="section-title">/ education</span>
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
