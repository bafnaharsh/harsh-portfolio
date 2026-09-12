import React, { useState } from "react";
import "../styles/ArtGallery.css";
import FadeInSection from "./FadeInSection";
import Lightbox from "./Lightbox";
import { Link } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { photos as sharedPhotos, photographyDescription } from "../data/photos";

// Gallery shows the collection in reverse of the homepage strip.
const photos = [...sharedPhotos].reverse();

const PhotographyGallery = () => {
  const [hiddenPhotos, setHiddenPhotos] = useState(() => new Set());
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const visiblePhotos = photos.filter((photo) => !hiddenPhotos.has(photo.src));

  return (
    <div className="art-gallery-page">
      <div className="section-header">
        <Link to="/" className="back-button">
          <ArrowBackRoundedIcon />
        </Link>
        <h1 className="section-title">/ photography</h1>
      </div>
      <FadeInSection delay="200ms">
        <div className="gallery-description">{photographyDescription}</div>
      </FadeInSection>
      <div className="gallery-grid">
        {visiblePhotos.length === 0 && (
          <FadeInSection delay="100ms">
            <div className="gallery-empty">
              Add photos to public/assets/photography to show this collection.
            </div>
          </FadeInSection>
        )}
        {visiblePhotos.map((photo, i) => (
          <FadeInSection key={photo.src} delay={(i + 1) * 100 + "ms"}>
            <button
              type="button"
              className="gallery-card"
              onClick={() => setLightboxIndex(i)}
              aria-label={`View ${photo.title} full size`}
            >
              <img
                src={photo.src}
                alt={photo.title}
                className="gallery-image"
                loading="lazy"
                decoding="async"
                onError={() => setHiddenPhotos((current) => new Set(current).add(photo.src))}
              />
            </button>
          </FadeInSection>
        ))}
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

export default PhotographyGallery;
