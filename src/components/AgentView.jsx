import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { portfolio } from "../data/portfolio";
import { renderRouteMarkdown } from "../lib/markdown";
import "../styles/AgentView.css";

// Internal links keep the visitor in agent mode; external ones open in a new tab.
const MarkdownLink = ({ href = "", children }) => {
  const internal = href.startsWith("/") && !/\.(pdf|jpe?g|png|webp)$/i.test(href);
  if (internal) {
    const url = new URL(href, "http://x");
    url.searchParams.set("view", "agent");
    return <Link to={`${url.pathname}${url.search}`}>{children}</Link>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

const AgentView = ({ pathname }) => {
  const [copied, setCopied] = useState(false);
  const markdown = useMemo(() => renderRouteMarkdown(portfolio, pathname), [pathname]);
  // The document this bar describes: "/" for the profile, "/resume", etc.
  const cleanPath = (pathname || "/").replace(/\/+$/, "") || "/";
  // Label shown next to "markdown · text/markdown": the agent home reads /agent.
  const route = cleanPath === "/" ? "/agent" : cleanPath;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = markdown;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } catch {
        /* no-op */
      }
      document.body.removeChild(ta);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  if (!markdown) return null;

  return (
    <main className="agent-view" id="agent-view">
      <div className="agent-view-bar">
        <span className="agent-view-label">
          markdown · text/markdown
          <span className="agent-view-path">{route}</span>
        </span>
        <button type="button" className="agent-view-copy" onClick={copy} aria-live="polite">
          {copied ? <CheckRoundedIcon sx={{ fontSize: 16 }} /> : <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
          {copied ? "Copied!" : "Copy raw Markdown"}
        </button>
      </div>
      <article className="agent-view-doc">
        <ReactMarkdown components={{ a: MarkdownLink }}>{markdown}</ReactMarkdown>
      </article>
    </main>
  );
};

export default AgentView;
