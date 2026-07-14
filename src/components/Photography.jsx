import React from "react";
import "../styles/Photography.css";
import FadeInSection from "./FadeInSection";
import { Link } from "react-router-dom";

const photos = [
  { src: "/assets/photography/kediler.jpeg", title: "street cats" },
  { src: "/assets/photography/IMG_20210428_183550.jpg", title: "evening frame" },
  { src: "/assets/photography/IMG_20210420_100741_174.jpg", title: "open sky" },
  { src: "/assets/photography/IMG_20210409_171430.jpg", title: "quiet corner" },
  { src: "/assets/photography/IMG_20210329_082927_984.jpg", title: "morning light" },
  { src: "/assets/photography/1000014681~3.jpg", title: "city texture" },
];

const Photography = () => {
  const [hiddenPhotos, setHiddenPhotos] = React.useState(() => new Set());
  const visiblePhotos = photos.filter((photo) => !hiddenPhotos.has(photo.src));

  return (
    <div id="photography">
      <div className="section-header">
        <span className="section-title">/ photography</span>
        <Link to="/photography" className="explore-link">
          Explore collection
        </Link>
      </div>
      <FadeInSection delay="200ms">
        <div className="photography-description">
          A small collection of photos, gathered from travel, streets, and quiet everyday frames.
        </div>
      </FadeInSection>
      <div className="photography-container">
        <div className="photography-grid">
          {visiblePhotos.length === 0 && (
            <FadeInSection delay="100ms">
              <div className="photography-empty">
                Add photos to public/assets/photography to show this collection.
              </div>
            </FadeInSection>
          )}
          {visiblePhotos.map((photo, i) => (
            <FadeInSection key={photo.src} delay={(i + 1) * 100 + "ms"}>
              <div className="photography-card">
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="photography-image"
                  onError={() => setHiddenPhotos((current) => new Set(current).add(photo.src))}
                />
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Photography;
