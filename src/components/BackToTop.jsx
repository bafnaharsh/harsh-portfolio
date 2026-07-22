import React, { useEffect, useState } from "react";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import "../styles/BackToTop.css";

// Floating button that appears after the visitor scrolls down a screenful and
// smoothly returns them to the top.
const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const scroller = document.scrollingElement || document.documentElement || document.body;

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    scroller.style.scrollBehavior = "auto";

    const resetTop = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      scroller.scrollTop = 0;
      window.scrollTo(0, 0);
      window.scroll({ top: 0, left: 0, behavior: "auto" });
    };

    resetTop();
    requestAnimationFrame(resetTop);
    setTimeout(resetTop, 50);
    setTimeout(resetTop, 150);
  };

  return (
    <button
      type="button"
      className={`back-to-top${visible ? " back-to-top--visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
    >
      <KeyboardArrowUpRoundedIcon />
    </button>
  );
};

export default BackToTop;
