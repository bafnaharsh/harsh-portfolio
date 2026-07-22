import React, { useState } from "react";
import "../styles/Photography.css";
import FadeInSection from "./FadeInSection";
import Lightbox from "./Lightbox";
import { Link } from "react-router-dom";
import { photos } from "../data/photos";

const Photography = () => {
  const [hiddenPhotos, setHiddenPhotos] = useState(() => new Set());
  const [lightboxIndex, setLightboxIndex] = useState(null);
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
              <button
                type="button"
                className="photography-card"
                onClick={() => setLightboxIndex(i)}
                aria-label={`View ${photo.title} full size`}
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="photography-image"
                  loading="lazy"
                  decoding="async"
                  onError={() => setHiddenPhotos((current) => new Set(current).add(photo.src))}
                />
              </button>
            </FadeInSection>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={visiblePhotos}
          index={lightboxIndex}
          onIndex={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};

export default Photography;
