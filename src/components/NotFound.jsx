import React from "react";
import { Link } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import FadeInSection from "./FadeInSection";
import "../styles/NotFound.css";

// Catch-all page for any unmatched route. Themed to match the rest of the site
// so a mistyped URL still feels intentional rather than broken.
const NotFound = () => (
  <div className="notfound-page">
    <FadeInSection>
      <div className="notfound-code">404</div>
      <h1 className="notfound-title">Page not found</h1>
      <p className="notfound-text">
        Looks like this page wandered off. Let&apos;s get you back on track.
      </p>
      <Link to="/" className="notfound-link">
        <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
        Back to home
      </Link>
    </FadeInSection>
  </div>
);

export default NotFound;
