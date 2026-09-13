import React, { Suspense, lazy, useEffect, useState } from "react";
import Intro from "./components/Intro";
import Experience from "./components/Experience";
import About from "./components/About";
import Projects from "./components/Projects";
import Education from "./components/Education";
import Photography from "./components/Photography";
import Credits from "./components/Credits";
import NavBar from "./components/NavBar";
import RobotGame from "./components/RobotGame";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollProgress from "./components/ScrollProgress";
import BackToTop from "./components/BackToTop";
import ViewModeToggle from "./components/ViewModeToggle";
import { useViewMode } from "./hooks/useViewMode";
import { useRouteMeta } from "./hooks/useRouteMeta";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import "./styles/Global.css";

// Route-level pages are code-split so they never weigh down the initial
// homepage bundle. RobotGame stays statically imported and always mounted so
// it can reliably manage its own show/hide via the `active` prop.
const PhotographyGallery = lazy(() => import("./components/PhotographyGallery"));
const CertificateViewer = lazy(() => import("./components/CertificateViewer"));
const ResumeViewer = lazy(() => import("./components/ResumeViewer"));
const NotFound = lazy(() => import("./components/NotFound"));
// Agent (markdown) view — only loaded when ?view=agent is present.
const AgentView = lazy(() => import("./components/AgentView"));

// Route paths that actually render content (as opposed to falling through to
// the catch-all 404). Used to decide whether the navbar/game chrome, which
// only makes sense on real pages, should render at all.
const isKnownRoute = (pathname) =>
  pathname === "/" ||
  pathname === "/photography" ||
  pathname === "/resume" ||
  pathname.startsWith("/certificate/") ||
  pathname.startsWith("/cert/");

function App() {
  const { pathname } = useLocation();
  const [gameActive, setGameActive] = useState(false);
  const [showGameInfo, setShowGameInfo] = useState(false);
  const knownRoute = isKnownRoute(pathname);
  const { view, setView, isAgent } = useViewMode();
  // Game mode is a human-view feature; switching to the agent view turns it
  // off, and coming back never resumes it.
  const showGame = knownRoute && !isAgent;
  const changeView = (next) => {
    if (next === "agent") setGameActive(false);
    setView(next);
  };

  useRouteMeta(pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="App">
      {knownRoute && <ScrollProgress />}
      {/* The agent view is a single document: no section links to the human page. */}
      {knownRoute && (
        <NavBar sectionLinks={!isAgent} brandHref={isAgent ? "/?view=agent" : "/"} />
      )}
      {showGame && (
        <div className="game-toggle-fixed">
          <div className="game-toggle-row">
            <button
              className={`game-toggle-btn${gameActive ? " game-toggle-btn--on" : ""}`}
              onClick={() => setGameActive((a) => !a)}
              title={gameActive ? "Disable game mode" : "Enable game mode"}
            >
              <span className="game-toggle-dot" />
              game mode
            </button>
            {gameActive && (
              <button
                className="game-info-btn"
                onMouseEnter={() => setShowGameInfo(true)}
                onMouseLeave={() => setShowGameInfo(false)}
              >
                i
              </button>
            )}
          </div>
          {showGameInfo && gameActive && (
            <div className="robot-game-info">
              <div className="robot-game-info-title">how to play</div>
              <div className="robot-game-info-row">
                <span className="robot-game-key">left/right</span>
                <span>move</span>
              </div>
              <div className="robot-game-info-row">
                <span className="robot-game-key">space</span>
                <span>jump</span>
              </div>
              <div className="robot-game-info-row">
                <span className="robot-game-key">scroll</span>
                <span>explore</span>
              </div>
              <div className="robot-game-info-goal">collect your scattered brain cells</div>
            </div>
          )}
        </div>
      )}
      {knownRoute && <RobotGame active={gameActive && showGame} />}
      <div id="content">
        <ErrorBoundary>
          <Suspense fallback={null}>
            {isAgent && knownRoute ? (
              <AgentView pathname={pathname} />
            ) : (
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Intro />
                    <About />
                    <Experience />
                    <Projects />
                    <Education />
                    <Photography />
                    <Credits />
                  </>
                }
              />
              <Route path="/photography" element={<PhotographyGallery />} />
              <Route path="/certificate/:slug" element={<CertificateViewer />} />
              <Route path="/cert/:slug" element={<CertificateViewer />} />
              <Route path="/resume" element={<ResumeViewer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            )}
          </Suspense>
        </ErrorBoundary>
      </div>
      {knownRoute && <BackToTop />}
      {knownRoute && <ViewModeToggle view={view} onChange={changeView} hidden={gameActive} />}
    </div>
  );
}

export default App;
