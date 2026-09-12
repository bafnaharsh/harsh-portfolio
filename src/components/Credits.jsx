import React from "react";
import "../styles/Credits.css";
import FadeInSection from "./FadeInSection";
import { portfolio } from "../data/portfolio";

const Credits = () => {
  return (
    <FadeInSection>
      <div id="credits">
        <div className="ending-credits">
          {portfolio.credits.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </div>
    </FadeInSection>
  );
};

export default Credits;
