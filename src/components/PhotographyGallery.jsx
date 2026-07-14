import React from "react";
import "../styles/ArtGallery.css";
import FadeInSection from "./FadeInSection";
import { Link } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

const photos = [
  { src: "/assets/photography/1000014681~3.jpg", title: "city texture" },
  { src: "/assets/photography/IMG_20210329_082927_984.jpg", title: "morning light" },
  { src: "/assets/photography/IMG_20210409_171430.jpg", title: "quiet corner" },
  { src: "/assets/photography/IMG_20210420_100741_174.jpg", title: "open sky" },
  { src: "/assets/photography/IMG_20210428_183550.jpg", title: "evening frame" },
  { src: "/assets/photography/kediler.jpeg", title: "street cats" },
];

const PhotographyGallery = () => {
  const [hiddenPhotos, setHiddenPhotos] = React.useState(() => new Set());
  const visiblePhotos = photos.filter((photo) => !hiddenPhotos.has(photo.src));

  return (
    <div className="art-gallery-page">
      <div className="section-header">
        <Link to="/" className="back-button">
          <ArrowBackRoundedIcon />
        </Link>
        <span className="section-title">/ photography</span>
      </div>
      <FadeInSection delay="200ms">
        <div className="gallery-description">
          A small collection of photos, gathered from travel, streets, and quiet everyday frames.
        </div>
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
            <div className="gallery-card">
              <img
                src={photo.src}
                alt={photo.title}
                className="gallery-image"
                onError={() => setHiddenPhotos((current) => new Set(current).add(photo.src))}
              />
            </div>
          </FadeInSection>
        ))}
      </div>
    </div>
  );
};

export default PhotographyGallery;
