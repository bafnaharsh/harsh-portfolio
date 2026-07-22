import React, { useState, useRef, useEffect, memo } from "react";

// If IntersectionObserver isn't available, content is shown immediately.
const supportsIO = typeof IntersectionObserver !== "undefined";

function FadeInSection({ delay, children }) {
  const [isVisible, setVisible] = useState(!supportsIO);
  const domRef = useRef();

  useEffect(() => {
    const node = domRef.current;
    if (!node || !supportsIO) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fade-in-section ${isVisible ? "is-visible" : ""}`}
      style={{ transitionDelay: delay }}
      ref={domRef}
    >
      {children}
    </div>
  );
}

export default memo(FadeInSection);
