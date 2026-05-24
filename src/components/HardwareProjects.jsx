import React from "react";
import "../styles/Projects.css";
import "../styles/HardwareProjects.css";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import FadeInSection from "./FadeInSection";
import { useNavigate } from "react-router-dom";

const hardwareProjects = {
  "Custom Build PC": {
    desc: "A high-performance white-themed PC build inspired by Rei Ayanami from Neon Genesis Evangelion.",
    techStack: "AMD Ryzen 7 5800X, RTX 4070 Ti, NZXT N7 B550, HYTE Y60",
    link: "/hardware/pc",
    image: "/assets/hardware/pc/images/cover.png"
  },
  "LED Sound Reactive Bracelet": {
    desc: "A wearable, sound-reactive LED bracelet that pulses to music in real-time, designed for music festivals.",
    techStack: "RP2040, WS2812B, MAX4466, LiPo",
    link: "/hardware/led-bracelet",
    image: "/assets/hardware/led-bracelet/cover.PNG"
  },
  "Grass Cyberdeck": {
    desc: "A Raspberry Pi retro gaming console built inside a wooden keepsake box, decorated with preserved moss to look like a tiny terrarium.",
    techStack: "Raspberry Pi 3B+, PiSugar 3 Plus, Hosyond 5\" DSI, RetroPie",
    link: "/hardware/grass-cyberdeck",
    image: "/assets/hardware/grass-cyberdeck/cover.PNG",
    imageStyle: { objectFit: "contain", padding: "12px" },
    badge: { text: "Teen Vogue feature", href: "https://www.teenvogue.com/story/diy-cyberdecks-newest-analog-trend-taking-social-media" }
  }
};

const HardwareProjects = () => {
  const navigate = useNavigate();

  return (
    <div id="hardware-projects">
      <div className="section-header">
        <span className="section-title">/ hardware</span>
      </div>
      <div className="project-container">
        <ul className="projects-grid">
          {Object.keys(hardwareProjects).map((key, i) => {
            const project = hardwareProjects[key];
            return (
              <FadeInSection key={i} delay={(i + 1) * 100 + "ms"}>
                <li
                  className={`projects-card ${project.image ? "transparent-card" : ""}`}
                  onClick={() => navigate(project.link)}
                >
                  {project.image ? (
                    <div className="project-image-container">
                      <img src={project.image} alt={key} className="project-image" style={project.imageStyle || {}} />
                    </div>
                  ) : (
                    <div className="card-header">
                      <div className="folder-icon">
                        <FolderOpenRoundedIcon sx={{ fontSize: 35 }} />
                      </div>
                    </div>
                  )}
                  <div className="card-title">{key}</div>
                  {project.badge && (
                    <a
                      href={project.badge.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-badge-link"
                      onClick={e => e.stopPropagation()}
                    >
                      {project.badge.text}
                      <OpenInNewRoundedIcon sx={{ fontSize: 12, display: "block" }} />
                    </a>
                  )}
                  <div className="card-desc">{project.desc}</div>
                  <div className="full-log-link">Full project log</div>
                  <div className="card-tech">{project.techStack}</div>
                </li>
              </FadeInSection>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default HardwareProjects;
