// Build step: derive every machine-readable artefact from src/data/portfolio.js
// and write it into dist/. Runs after `vite build` (see package.json "build").
//
//   dist/_md/**.md                         markdown per route (Accept negotiation)
//   dist/llms.txt
//   dist/api/profile.json, projects.json, projects/<slug>.json
//   dist/.well-known/api-catalog           RFC 9727 linkset
//   dist/.well-known/ard.json (+ ai-catalog.json mirror)   ARD catalog
//   dist/.well-known/agent-skills/index.json + <skill>/SKILL.md (sha256 digest)
//   dist/sitemap.xml
//
// One script, one source, no drift.
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { portfolio, SITE_URL, routes } from "../src/data/portfolio.js";
import {
  renderProfileMarkdown,
  renderCertificateMarkdown,
  renderResumeMarkdown,
  renderPhotographyMarkdown,
  renderLlmsTxt,
} from "../src/lib/markdown.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
if (!existsSync(DIST)) {
  console.error("dist/ not found — run `vite build` first");
  process.exit(1);
}

const abs = (p) => `${SITE_URL}${p}`;
const written = [];
const write = (rel, content) => {
  const file = join(DIST, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  written.push(rel);
};
const json = (obj) => JSON.stringify(obj, null, 2) + "\n";
const opts = { siteUrl: SITE_URL };
const { profile, links, experience, projects, skills, education, certifications } = portfolio;

// ---- Markdown documents ----------------------------------------------------
write("_md/index.md", renderProfileMarkdown(portfolio, opts));
write("_md/resume.md", renderResumeMarkdown(portfolio, opts));
write("_md/photography.md", renderPhotographyMarkdown(portfolio, opts));
for (const cert of certifications) {
  write(`_md/certificate/${cert.slug}.md`, renderCertificateMarkdown(portfolio, cert, opts));
}

// ---- llms.txt --------------------------------------------------------------
write("llms.txt", renderLlmsTxt(portfolio, opts));

// ---- JSON API (static, read-only) -----------------------------------------
const certificationsJson = certifications.map((c) => ({
  name: c.name,
  issuer: c.issuer,
  url: abs(`/certificate/${c.slug}`),
  pdf: abs(c.file),
}));

const profileJson = {
  name: profile.name,
  role: profile.role,
  summary: profile.summary,
  location: profile.location || null,
  email: profile.email,
  links: {
    site: links.site,
    github: links.github,
    linkedin: links.linkedin,
    resume: abs(links.resume),
  },
  skills,
  experience: experience.map((j) => ({
    company: j.company,
    companyUrl: j.companyUrl,
    role: j.role,
    start: j.start,
    end: j.end,
    location: j.location || null,
    bullets: j.bullets,
    stack: j.stack,
  })),
  education,
  certifications: certificationsJson,
  projects: abs("/api/projects.json"),
  markdown: abs("/_md/index.md"),
  source: links.site,
};
write("api/profile.json", json(profileJson));

const projectJson = (p) => ({
  slug: p.slug,
  title: p.title,
  company: p.company,
  summary: p.summary,
  stack: p.stack,
  links: p.links,
  url: abs(`/api/projects/${p.slug}.json`),
});
write("api/projects.json", json({ owner: profile.name, count: projects.length, projects: projects.map(projectJson) }));
for (const p of projects) write(`api/projects/${p.slug}.json`, json(projectJson(p)));

// ---- Agent Skills Discovery v0.2.0 ----------------------------------------
const skillName = "harsh-bafna-profile";
const skillMd = `---
name: ${skillName}
description: Retrieve Harsh Bafna's professional profile, experience, projects, skills, education, certifications and public contact links. Read-only; all data is already public on ${SITE_URL}.
---

# ${profile.name} — profile lookup

Use this skill when a user asks who ${profile.name} is, what he has built, what his
technical background is, or how to reach him professionally.

## Sources (all public, read-only, no authentication)

- Full profile as markdown: ${abs("/_md/index.md")}
  (or request ${links.site} with \`Accept: text/markdown\`)
- Profile as JSON: ${abs("/api/profile.json")}
- Projects as JSON: ${abs("/api/projects.json")}
- Plain-text summary: ${abs("/llms.txt")}
- Resume (PDF): ${abs(links.resume)}

## How to answer

1. Fetch \`/api/profile.json\` (or the markdown) and quote only what it contains.
2. Do not infer employers, dates, metrics or credentials that are not present.
3. For contact, point to the email or LinkedIn listed under \`links\`.
`;
const skillPath = `.well-known/agent-skills/${skillName}/SKILL.md`;
write(skillPath, skillMd);
const digest = "sha256:" + createHash("sha256").update(skillMd).digest("hex");
write(
  ".well-known/agent-skills/index.json",
  json({
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: skillName,
        type: "skill-md",
        description:
          "Retrieve Harsh Bafna's professional profile, experience, projects, skills, education, certifications and public contact links.",
        url: `/${skillPath}`,
        digest,
      },
    ],
  })
);

// ---- RFC 9727 API catalog (linkset) ---------------------------------------
write(
  ".well-known/api-catalog",
  json({
    linkset: [
      {
        anchor: abs("/.well-known/api-catalog"),
        item: [
          { href: abs("/api/profile.json"), type: "application/json", title: "Profile" },
          { href: abs("/api/projects.json"), type: "application/json", title: "Projects" },
          { href: abs("/llms.txt"), type: "text/plain", title: "llms.txt" },
          { href: abs("/_md/index.md"), type: "text/markdown", title: "Profile (markdown)" },
        ],
        "service-doc": [{ href: abs("/llms.txt"), type: "text/plain" }],
      },
    ],
  })
);

// ---- ARD catalog (current spec: /.well-known/ard.json; legacy mirror kept) --
const host = SITE_URL.replace(/^https?:\/\//, "");
const urn = (ns, name) => `urn:air:${host}:${ns}:${name}`;
const ard = {
  specVersion: "0.91",
  host: { name: profile.name, url: links.site },
  entries: [
    {
      identifier: urn("profile", "json"),
      displayName: `${profile.name} — profile (JSON)`,
      type: "application/json",
      url: abs("/api/profile.json"),
      description: `Structured, read-only profile of ${profile.name}: role, summary, experience, education, skills, certifications and public links.`,
      capabilities: ["ProfileLookup"],
      representativeQueries: [
        "Who is Harsh Bafna?",
        "What is Harsh Bafna's tech stack?",
        "Where has Harsh Bafna worked?",
      ],
    },
    {
      identifier: urn("profile", "markdown"),
      displayName: `${profile.name} — profile (Markdown)`,
      type: "text/markdown",
      url: abs("/_md/index.md"),
      description: "The same profile as a markdown document, also served at the site root for Accept: text/markdown.",
      capabilities: ["ProfileLookup"],
      representativeQueries: ["Summarise Harsh Bafna's background", "Give me Harsh Bafna's resume as text"],
    },
    {
      identifier: urn("projects", "json"),
      displayName: `${profile.name} — projects (JSON)`,
      type: "application/json",
      url: abs("/api/projects.json"),
      description: "Read-only list of software projects with company, summary and stack.",
      capabilities: ["ProjectLookup"],
      representativeQueries: [
        "What ML projects has Harsh Bafna built?",
        "Which projects did Harsh Bafna do at Quantiphi?",
      ],
    },
    {
      identifier: urn("skills", "profile-skill"),
      displayName: `${profile.name} — agent skill`,
      type: "text/markdown",
      url: abs(`/${skillPath}`),
      description: "Agent Skills (SKILL.md) instructions for answering questions about Harsh Bafna from public data.",
      capabilities: ["ProfileLookup"],
      representativeQueries: ["How should an agent look up Harsh Bafna's profile?", "Is there a skill for Harsh Bafna's portfolio?"],
    },
  ],
};
write(".well-known/ard.json", json(ard));
write(".well-known/ai-catalog.json", json(ard));

// ---- _redirects: explicit SPA routes + a real 404 for everything else -------
// Generated from the same route list as the sitemap so the two cannot drift.
// Static files in dist/ are served before these rules are consulted.
const redirectLines = [
  "# Generated by scripts/generate-agent-assets.mjs — do not edit by hand.",
  "# Real SPA routes (each renders in the React app):",
  ...routes().map((r) => `${r.path.padEnd(48)}/index.html   200`),
  ...certifications.map((c) => `${`/cert/${c.slug}`.padEnd(48)}/index.html   200`),
  "",
  "# Everything else is genuinely not found",
  `${"/*".padEnd(48)}/404.html     404`,
  "",
];
write("_redirects", redirectLines.join("\n"));

// ---- sitemap.xml -----------------------------------------------------------
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes()
    .map(
      (r) =>
        `  <url>\n    <loc>${abs(r.path)}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
    )
    .join("\n") +
  `\n</urlset>\n`;
write("sitemap.xml", sitemap);

console.log(`generate-agent-assets: wrote ${written.length} files\n  ` + written.join("\n  "));
