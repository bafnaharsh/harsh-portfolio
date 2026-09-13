import React, { useState, useEffect, useRef } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import HoverPreview from "./HoverPreview";
import "../styles/NavBar.css";
import { portfolio } from "../data/portfolio";

const { profile, links } = portfolio;

// Display forms derived from the data — nothing here is hardcoded.
const emailAddress = links.email.replace(/^mailto:/i, "");
const prettyUrl = (url) => url.replace(/^https?:\/\//i, "").replace(/\/+$/, "");

// Thumbnails of the pages these links open — see scripts/generate-previews.mjs.
const githubShot = { src: "/previews/github.webp", width: 560, height: 350 };
const linkedinShot = { src: "/previews/linkedin.webp", width: 560, height: 350 };

const NavBar = () => {
  const [expanded, setExpanded] = useState(false);
  const scrollPos = useRef(0);

  useEffect(() => {
    if (expanded) {
      scrollPos.current = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPos.current}px`;
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
  }, [expanded]);

  return (
    <Navbar
      fixed="top"
      expand="lg"
      className="navbar"
      data-bs-theme="dark"
      expanded={expanded}
      onToggle={(isExpanded) => setExpanded(isExpanded)}
    >
            <Container>
        <Navbar.Brand href="/">{profile.name}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto" onSelect={() => setExpanded(false)}>
            <Nav.Link href="/#intro">Home</Nav.Link>
            <Nav.Link href="/#about">About</Nav.Link>
            <Nav.Link href="/#experience">Experience</Nav.Link>
            <Nav.Link href="/#projects">Software & Certifications</Nav.Link>
            <Nav.Link href="/#education">Education</Nav.Link>
            <Nav.Link href="/#photography">Photography</Nav.Link>
          </Nav>
          <Nav className="ms-auto" onSelect={() => setExpanded(false)}>
            {/* Icon-only links: the MUI icons are aria-hidden, so each link
                needs an explicit accessible name for screen readers. */}
            <HoverPreview title="Email" detail={emailAddress} hint="opens your mail app" placement="bottom">
              <Nav.Link href={links.email} aria-label={`Email ${profile.name}`}>
                <EmailRoundedIcon style={{ fontSize: 20 }} />
              </Nav.Link>
            </HoverPreview>
            <HoverPreview
              title="GitHub"
              detail={prettyUrl(links.github)}
              hint="opens in a new tab"
              image={githubShot}
              chromeUrl={prettyUrl(links.github)}
              placement="bottom"
            >
              <Nav.Link
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile (opens in new tab)"
              >
                <GitHubIcon style={{ fontSize: 19 }} />
              </Nav.Link>
            </HoverPreview>
            <HoverPreview
              title="LinkedIn"
              detail={prettyUrl(links.linkedin)}
              hint="opens in a new tab"
              image={linkedinShot}
              chromeUrl={prettyUrl(links.linkedin)}
              placement="bottom"
            >
              <Nav.Link
                href={links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile (opens in new tab)"
              >
                <LinkedInIcon style={{ fontSize: 21 }} />
              </Nav.Link>
            </HoverPreview>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
