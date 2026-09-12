// Serialises the `portfolio` object into markdown documents.
//
// Used in two places so the two can never disagree:
//   • the in-browser Agent view (rendered with react-markdown)
//   • scripts/generate-agent-assets.mjs, which writes dist/_md/*.md for the
//     HTTP `Accept: text/markdown` negotiation and /llms.txt
//
// Pure functions, no React, no DOM — importable from Node at build time.

const joinSegments = (segments) =>
  segments
    .map((s) => (s.href ? `[${s.text.trim()}](${s.href})` : s.text))
    .join("")
    // A linked segment may start with a space in the UI ("at Quantiphi");
    // after trimming inside the brackets, restore the single space between words.
    .replace(/(\S)\[/g, "$1 [")
    .replace(/\s{2,}/g, " ")
    .trim();

const dateRange = (start, end) => [start, end].filter(Boolean).join(" – ");

const abs = (siteUrl, path) => (path.startsWith("http") ? path : `${siteUrl}${path}`);

/** Full profile document — the / route in agent mode and dist/_md/index.md. */
export function renderProfileMarkdown(p, { siteUrl = "" } = {}) {
  const { profile, about, experience, projects, skills, education, certifications } = p;
  const lines = [];

  lines.push(`# ${profile.name}`, "");
  lines.push([profile.role, profile.location].filter(Boolean).join(" · "), "");

  lines.push("## Summary", "");
  lines.push(profile.summary, "");
  for (const para of about.paragraphs) lines.push(joinSegments(para), "");

  lines.push("## Experience", "");
  for (const job of experience) {
    const company = job.companyUrl ? `[${job.company}](${job.companyUrl})` : job.company;
    lines.push(`### ${job.role} — ${company}`, "");
    lines.push(`${dateRange(job.start, job.end)}${job.location ? ` · ${job.location}` : ""}`, "");
    for (const b of job.bullets) lines.push(`- ${b}`);
    if (job.stack?.length) lines.push("", `Stack: ${job.stack.join(", ")}`);
    if (job.certificateSlug) {
      const cert = certifications.find((c) => c.slug === job.certificateSlug);
      if (cert) lines.push("", `Certificate: [${cert.name}](${abs(siteUrl, `/certificate/${cert.slug}`)})`);
    }
    lines.push("");
  }

  lines.push("## Projects", "");
  for (const pr of projects) {
    lines.push(`### ${pr.title}`, "");
    lines.push(`${pr.company}. ${pr.summary}`, "");
    if (pr.stack?.length) lines.push(`Stack: ${pr.stack.join(", ")}`, "");
    for (const [label, href] of Object.entries(pr.links ?? {})) lines.push(`- [${label}](${href})`);
  }

  lines.push("## Skills", "");
  for (const group of skills) lines.push(`- **${group.group}:** ${group.items.join(", ")}`);
  lines.push("");

  lines.push("## Education", "");
  for (const e of education) {
    lines.push(`### ${e.institution}`, "");
    lines.push(`${e.qualification}${e.detail ? ` — ${e.detail}` : ""}`, "");
    lines.push([dateRange(e.start, e.end), e.location].filter(Boolean).join(" · "), "");
  }

  lines.push("## Certifications", "");
  for (const c of certifications) {
    lines.push(`- [${c.name}](${abs(siteUrl, `/certificate/${c.slug}`)}) — ${c.issuer}`);
  }
  lines.push("");

  lines.push("## Links", "");
  lines.push(...linkList(p, siteUrl));
  lines.push("");

  return lines.join("\n");
}

// Descriptive anchors only — never a bare URL.
const linkList = (p, siteUrl) => [
  `- [Portfolio website](${p.links.site})`,
  `- [GitHub profile](${p.links.github})`,
  `- [LinkedIn profile](${p.links.linkedin})`,
  `- [Resume (PDF)](${abs(siteUrl, p.links.resume)})`,
  `- [Email ${p.profile.name}](mailto:${p.profile.email})`,
];

/** One certificate — /certificate/<slug> in agent mode and dist/_md/certificate/<slug>.md */
export function renderCertificateMarkdown(p, cert, { siteUrl = "" } = {}) {
  const others = p.certifications.filter((c) => c.slug !== cert.slug);
  return [
    `# ${cert.name}`,
    "",
    `Certificate issued to ${p.profile.name} by ${cert.issuer}.`,
    "",
    `- [Open the certificate PDF](${abs(siteUrl, cert.file)})`,
    `- [Back to ${p.profile.name}'s profile](${abs(siteUrl, "/")})`,
    "",
    "## Other certificates",
    "",
    ...others.map((c) => `- [${c.name}](${abs(siteUrl, `/certificate/${c.slug}`)}) — ${c.issuer}`),
    "",
  ].join("\n");
}

/** The /resume route in agent mode and dist/_md/resume.md */
export function renderResumeMarkdown(p, { siteUrl = "" } = {}) {
  return [
    `# Resume — ${p.profile.name}`,
    "",
    `${p.profile.role}. ${p.profile.summary}`,
    "",
    `- [Download the resume (PDF)](${abs(siteUrl, p.links.resume)})`,
    `- [Full profile](${abs(siteUrl, "/")})`,
    "",
  ].join("\n");
}

/** The /photography route in agent mode and dist/_md/photography.md */
export function renderPhotographyMarkdown(p, { siteUrl = "" } = {}) {
  return [
    `# Photography — ${p.profile.name}`,
    "",
    p.photography.description,
    "",
    ...p.photography.photos.map((ph) => `- [${ph.title}](${abs(siteUrl, ph.src)})`),
    "",
    `[Back to ${p.profile.name}'s profile](${abs(siteUrl, "/")})`,
    "",
  ].join("\n");
}

/** /llms.txt — same facts, llms.txt conventions. */
export function renderLlmsTxt(p, { siteUrl = "" } = {}) {
  const { profile, links, experience, projects, skills, certifications } = p;
  return [
    `# ${profile.name}`,
    "",
    `> ${profile.summary}`,
    "",
    "## Profile",
    `- Role: ${profile.role}`,
    ...(profile.location ? [`- Location: ${profile.location}`] : []),
    `- Email: ${profile.email}`,
    "",
    "## Experience",
    ...experience.map((j) => `- ${j.company} — ${j.role} (${dateRange(j.start, j.end)})`),
    "",
    "## Projects",
    ...projects.map((pr) => `- ${pr.title} (${pr.company}) — ${pr.summary}`),
    "",
    "## Skills",
    ...skills.map((g) => `- ${g.group}: ${g.items.join(", ")}`),
    "",
    "## Certifications",
    ...certifications.map((c) => `- [${c.name}](${abs(siteUrl, `/certificate/${c.slug}`)}) — ${c.issuer}`),
    "",
    "## Links",
    ...linkList(p, siteUrl),
    "",
    "## Machine-readable",
    `- [Profile as markdown](${abs(siteUrl, "/_md/index.md")}) — or request ${links.site} with \`Accept: text/markdown\``,
    `- [Profile as JSON](${abs(siteUrl, "/api/profile.json")})`,
    `- [Projects as JSON](${abs(siteUrl, "/api/projects.json")})`,
    "",
  ].join("\n");
}

/** Markdown for a given route path, or null if the route has no document. */
export function renderRouteMarkdown(p, pathname, opts) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return renderProfileMarkdown(p, opts);
  if (path === "/resume") return renderResumeMarkdown(p, opts);
  if (path === "/photography") return renderPhotographyMarkdown(p, opts);
  const m = path.match(/^\/(?:certificate|cert)\/([^/]+)$/);
  if (m) {
    const cert = p.certifications.find((c) => c.slug === m[1]);
    return cert ? renderCertificateMarkdown(p, cert, opts) : null;
  }
  return null;
}
