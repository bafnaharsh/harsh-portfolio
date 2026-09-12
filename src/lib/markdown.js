// Serialises the `portfolio` object into markdown documents.
//
// Used in two places so the two can never disagree:
//   • the in-browser Agent view (rendered with react-markdown)
//   • scripts/generate-agent-assets.mjs, which writes dist/_md/*.md for the
//     HTTP `Accept: text/markdown` negotiation and /llms.txt
//
// Pure functions, no React, no DOM — importable from Node at build time.
//
// House style for every document produced here:
//   • one `# Title` block: name, a `**role** · location` line, one-line summary
//   • `---` between major sections, `## Section` headings in a fixed rhythm
//   • entries are `### Role — Company` followed by an *italic meta line*
//     (dates · location) that the CSS renders muted — see `h3 + p em`
//   • stack/tag words are inline code so they render as chips
//   • never a bare URL — always `[descriptive text](url)`
//   • CommonMark only (no GFM): no tables, no footnotes, no strikethrough

/** Renders one About paragraph segment: link, bold run, or plain text. */
const segmentText = (s) => {
  if (s.href) return `[${s.text.trim()}](${s.href})`;
  if (s.bold) {
    const [, lead, body, tail] = s.text.match(/^(\s*)([\s\S]*?)(\s*)$/);
    return body ? `${lead}**${body}**${tail}` : s.text;
  }
  return s.text;
};

const joinSegments = (segments) =>
  segments
    .map(segmentText)
    .join("")
    // A linked segment may start with a space in the UI ("at Quantiphi");
    // after trimming inside the brackets, restore the single space between words.
    .replace(/(\S)\[/g, "$1 [")
    .replace(/\s{2,}/g, " ")
    .trim();

const dateRange = (start, end) => [start, end].filter(Boolean).join(" – ");

const abs = (siteUrl, path) => (path.startsWith("http") ? path : `${siteUrl}${path}`);

/** `a · b · c`, skipping empties. */
const meta = (...parts) => parts.filter(Boolean).join(" · ");

/** An italic meta line directly under a heading (styled muted by the CSS). */
const metaLine = (...parts) => {
  const text = meta(...parts);
  return text ? [`*${text}*`, ""] : [];
};

/** `` `Python` `SQL` `` — inline code so the view renders them as chips. */
const chips = (items) => items.map((i) => `\`${i}\``).join(" ");

const RULE = ["---", ""];

// Descriptive anchors only — never a bare URL.
const linkList = (p, siteUrl) => [
  `- [Portfolio website](${p.links.site}) — the human-readable version of this document`,
  `- [GitHub profile](${p.links.github}) — code and experiments`,
  `- [LinkedIn profile](${p.links.linkedin}) — work history and contact`,
  `- [Resume (PDF)](${abs(siteUrl, p.links.resume)}) — one-page resume`,
  `- [Email ${p.profile.name}](mailto:${p.profile.email}) — ${p.profile.email}`,
];

/** The compact "at a glance" block shared by the profile and resume documents. */
const atAGlance = (p, siteUrl) => {
  const { profile, links } = p;
  return [
    `- **Role:** ${profile.role}`,
    ...(profile.location ? [`- **Location:** ${profile.location}`] : []),
    `- **Email:** [${profile.email}](mailto:${profile.email})`,
    `- **Links:** [Portfolio](${links.site}) · [GitHub](${links.github}) · [LinkedIn](${links.linkedin}) · [Resume (PDF)](${abs(siteUrl, links.resume)})`,
    ...(profile.knowsAbout?.length ? [`- **Focus:** ${profile.knowsAbout.join(", ")}`] : []),
    "",
  ];
};

/** `# Name` + role/location line + one-line summary. */
const titleBlock = (p, title) => [
  `# ${title}`,
  "",
  meta(`**${p.profile.role}**`, p.profile.location),
  "",
  p.profile.summary,
  "",
];

const experienceEntry = (job, certifications, siteUrl) => {
  const company = job.companyUrl ? `[${job.company}](${job.companyUrl})` : job.company;
  const out = [`### ${job.role} — ${company}`, "", ...metaLine(dateRange(job.start, job.end), job.location)];
  for (const b of job.bullets) out.push(`- ${b}`);
  out.push("");
  if (job.stack?.length) out.push(`**Stack:** ${chips(job.stack)}`, "");
  if (job.certificateSlug) {
    const cert = certifications.find((c) => c.slug === job.certificateSlug);
    if (cert) out.push(`**Certificate:** [${cert.name}](${abs(siteUrl, `/certificate/${cert.slug}`)})`, "");
  }
  return out;
};

const projectEntry = (pr) => {
  const out = [`### ${pr.title}`, "", ...metaLine(pr.company, ...(pr.resumeTags ?? []))];
  out.push(pr.summary, "");
  for (const d of pr.details ?? []) out.push(`- ${d}`);
  if (pr.details?.length) out.push("");
  if (pr.stack?.length) out.push(`**Stack:** ${chips(pr.stack)}`, "");
  for (const [label, href] of Object.entries(pr.links ?? {})) out.push(`- [${label}](${href})`);
  return out;
};

const educationEntry = (e) => [
  `### ${e.institution}`,
  "",
  ...metaLine(dateRange(e.start, e.end), e.location),
  `${e.qualification}${e.detail ? ` — ${e.detail}` : ""}`,
  "",
];

/** Full profile document — the / route in agent mode and dist/_md/index.md. */
export function renderProfileMarkdown(p, { siteUrl = "" } = {}) {
  const { profile, about, experience, projects, skills, education, certifications } = p;
  const lines = [];

  lines.push(...titleBlock(p, profile.name), ...RULE);

  lines.push("## At a glance", "", ...atAGlance(p, siteUrl), ...RULE);

  lines.push("## Summary", "");
  if (profile.resumeSummary) lines.push(profile.resumeSummary, "");
  for (const para of about.paragraphs) lines.push(joinSegments(para), "");
  if (about.techStack?.length) lines.push(`**${about.techIntro}** ${chips(about.techStack)}`, "");
  lines.push(...RULE);

  lines.push("## Experience", "");
  for (const job of experience) lines.push(...experienceEntry(job, certifications, siteUrl));
  lines.push(...RULE);

  lines.push("## Projects", "");
  for (const pr of projects) lines.push(...projectEntry(pr));
  lines.push(...RULE);

  lines.push("## Skills", "");
  for (const group of skills) lines.push(`- **${group.group}:** ${group.items.join(", ")}`);
  lines.push("", ...RULE);

  lines.push("## Education", "");
  for (const e of education) lines.push(...educationEntry(e));
  lines.push(...RULE);

  lines.push("## Certifications", "");
  for (const c of certifications) {
    lines.push(`- [${c.name}](${abs(siteUrl, `/certificate/${c.slug}`)}) — ${c.issuer}`);
  }
  lines.push("", ...RULE);

  lines.push("## Links", "");
  lines.push(...linkList(p, siteUrl));
  lines.push("");

  return lines.join("\n");
}

/** One certificate — /certificate/<slug> in agent mode and dist/_md/certificate/<slug>.md */
export function renderCertificateMarkdown(p, cert, { siteUrl = "" } = {}) {
  const others = p.certifications.filter((c) => c.slug !== cert.slug);
  return [
    `# ${cert.name}`,
    "",
    meta(`**${cert.issuer}**`, `awarded to ${p.profile.name}`),
    "",
    `Certificate issued to ${p.profile.name} by ${cert.issuer}.`,
    "",
    ...RULE,
    "## At a glance",
    "",
    `- **Certificate:** ${cert.name}`,
    `- **Issuer:** ${cert.issuer}`,
    `- **Awarded to:** ${p.profile.name}`,
    "- **Format:** `PDF`",
    "",
    `- [Open the certificate PDF](${abs(siteUrl, cert.file)})`,
    `- [Back to ${p.profile.name}'s profile](${abs(siteUrl, "/")})`,
    "",
    ...RULE,
    "## Other certificates",
    "",
    ...others.map((c) => `- [${c.name}](${abs(siteUrl, `/certificate/${c.slug}`)}) — ${c.issuer}`),
    "",
  ].join("\n");
}

/** The /resume route in agent mode and dist/_md/resume.md */
export function renderResumeMarkdown(p, { siteUrl = "" } = {}) {
  const { profile, experience, projects, skills, education, certifications } = p;
  const lines = [];

  lines.push(`# Resume — ${profile.name}`, "");
  lines.push(meta(`**${profile.role}**`, profile.location), "");
  lines.push(profile.summary, "");
  lines.push(...RULE);

  lines.push("## At a glance", "", ...atAGlance(p, siteUrl), ...RULE);

  lines.push("## Summary", "");
  lines.push(profile.resumeSummary || profile.summary, "");
  lines.push(...RULE);

  lines.push("## Experience", "");
  for (const job of experience) lines.push(...experienceEntry(job, certifications, siteUrl));
  lines.push(...RULE);

  lines.push("## Projects", "");
  for (const pr of projects) {
    const tags = pr.stack?.length ? ` ${chips(pr.stack)}` : "";
    lines.push(`- **${pr.title}** (${pr.company}) — ${pr.summary}${tags}`);
  }
  lines.push("", ...RULE);

  lines.push("## Skills", "");
  for (const group of skills) lines.push(`- **${group.group}:** ${group.items.join(", ")}`);
  lines.push("", ...RULE);

  lines.push("## Education", "");
  for (const e of education) lines.push(...educationEntry(e));
  lines.push(...RULE);

  lines.push("## Links", "");
  lines.push(`- [Download the resume (PDF)](${abs(siteUrl, p.links.resume)}) — the one-page version`);
  lines.push(`- [Full profile](${abs(siteUrl, "/")}) — experience, projects and certifications in detail`);
  lines.push(`- [Email ${profile.name}](mailto:${profile.email}) — ${profile.email}`);
  lines.push("");

  return lines.join("\n");
}

/** The /photography route in agent mode and dist/_md/photography.md */
export function renderPhotographyMarkdown(p, { siteUrl = "" } = {}) {
  const { photos, description } = p.photography;
  return [
    `# Photography — ${p.profile.name}`,
    "",
    meta(`**${photos.length} photographs**`, "travel, streets and everyday frames"),
    "",
    description,
    "",
    ...RULE,
    "## The photographs",
    "",
    ...photos.map(
      (ph) => `- [${ph.title}](${abs(siteUrl, ph.src)}) — \`${ph.width}×${ph.height}\``,
    ),
    "",
    ...RULE,
    "## Links",
    "",
    `- [Back to ${p.profile.name}'s profile](${abs(siteUrl, "/")}) — experience, projects and contact details`,
    `- [Email ${p.profile.name}](mailto:${p.profile.email}) — ${p.profile.email}`,
    "",
  ].join("\n");
}

/** /llms.txt — same facts, llms.txt conventions. */
export function renderLlmsTxt(p, { siteUrl = "" } = {}) {
  const { profile, experience, projects, skills, certifications } = p;
  return [
    `# ${profile.name}`,
    "",
    `> ${profile.summary}`,
    "",
    profile.resumeSummary,
    "",
    "## Profile",
    `- Role: ${profile.role}`,
    ...(profile.location ? [`- Location: ${profile.location}`] : []),
    `- Email: ${profile.email}`,
    ...(profile.knowsAbout?.length ? [`- Focus: ${profile.knowsAbout.join(", ")}`] : []),
    "",
    "## Experience",
    ...experience.map(
      (j) => `- ${j.company} — ${j.role} (${dateRange(j.start, j.end)}${j.location ? `, ${j.location}` : ""})`,
    ),
    "",
    "## Projects",
    ...projects.map((pr) => {
      const tags = pr.resumeTags?.length ? pr.resumeTags : (pr.stack ?? []);
      return `- ${pr.title} (${pr.company}) — ${pr.summary}${tags.length ? ` [${tags.join(", ")}]` : ""}`;
    }),
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
    `- [Profile as markdown](${abs(siteUrl, "/_md/index.md")}) — or request the site root with \`Accept: text/markdown\``,
    `- [Resume as markdown](${abs(siteUrl, "/_md/resume.md")})`,
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
