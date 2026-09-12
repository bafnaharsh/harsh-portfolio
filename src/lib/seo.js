// Per-route metadata and structured data, derived from portfolio.js.
// Used by the Vite head plugin (build time, initial HTML) and by the
// useRouteMeta hook (runtime, per route). Pure functions, no DOM.
import { portfolio, SITE_URL } from "../data/portfolio.js";

const { profile, meta, links, photography, certifications } = portfolio;

const suffix = ` — ${profile.name}`;

/** Title, description and canonical for a pathname (query string ignored). */
export function routeMeta(pathname) {
  const path = (pathname || "/").replace(/\/+$/, "") || "/";

  if (path === "/") {
    return { title: meta.title, description: meta.description, canonical: `${SITE_URL}/`, index: true };
  }
  if (path === "/photography") {
    return {
      title: `Photography${suffix}`,
      description: `${photography.description} Photos by ${profile.name}.`,
      canonical: `${SITE_URL}/photography`,
      index: true,
    };
  }
  if (path === "/resume") {
    return {
      title: `Resume${suffix}`,
      description: `Resume of ${profile.name}, ${profile.role}. Open or download the PDF.`,
      canonical: `${SITE_URL}/resume`,
      index: true,
    };
  }
  const cert = path.match(/^\/(?:certificate|cert)\/([^/]+)$/);
  if (cert) {
    const c = certifications.find((x) => x.slug === cert[1]);
    if (c) {
      return {
        title: `${c.name}${suffix}`,
        description: `${c.name} certificate issued to ${profile.name} by ${c.issuer}. Open the PDF.`,
        // /cert/<slug> is an alias — canonical is always the /certificate/ form
        canonical: `${SITE_URL}/certificate/${c.slug}`,
        index: true,
      };
    }
  }
  return {
    title: `Page not found${suffix}`,
    description: meta.description,
    canonical: null,
    index: false,
  };
}

/** schema.org Person — identity facts, safe to ship in the static HTML. */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: profile.name,
    url: `${SITE_URL}/`,
    image: `${SITE_URL}${profile.avatar}`,
    jobTitle: profile.role,
    description: profile.summary,
    worksFor: { "@type": "Organization", name: meta.worksFor, url: links.quantiphi },
    email: `mailto:${profile.email}`,
    knowsAbout: profile.knowsAbout,
    ...(profile.location ? { homeLocation: { "@type": "Place", name: profile.location } } : {}),
    alumniOf: portfolio.education.map((e) => ({
      "@type": "EducationalOrganization",
      name: e.institution,
    })),
    sameAs: [links.github, links.linkedin],
  };
}

/** schema.org ProfilePage for the homepage only. */
export function profilePageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/#profilepage`,
    url: `${SITE_URL}/`,
    name: meta.title,
    description: meta.description,
    mainEntity: { "@id": `${SITE_URL}/#person` },
  };
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * The <head> block for the initial HTML document (all routes share it; the
 * runtime hook then adjusts title/description/canonical per route). Keeps
 * core identity in the HTML for crawlers that do not run JavaScript.
 */
export function staticHeadHtml() {
  const home = routeMeta("/");
  const og = `${SITE_URL}/og-image.png`;
  return [
    `<title>${esc(home.title)}</title>`,
    `<meta name="description" content="${esc(home.description)}" />`,
    `<meta name="author" content="${esc(profile.name)}" />`,
    `<meta name="keywords" content="${esc(meta.keywords)}" />`,
    `<link rel="canonical" href="${home.canonical}" />`,
    `<link rel="alternate" type="text/markdown" href="${SITE_URL}/_md/index.md" title="${esc(profile.name)} — profile (Markdown)" />`,
    `<link rel="alternate" type="application/json" href="${SITE_URL}/api/profile.json" title="${esc(profile.name)} — profile (JSON)" />`,
    `<link rel="ard" href="${SITE_URL}/.well-known/ard.json" />`,
    `<link rel="ai-catalog" href="${SITE_URL}/.well-known/ai-catalog.json" />`,
    `<link rel="api-catalog" href="${SITE_URL}/.well-known/api-catalog" />`,
    ``,
    `<!-- Open Graph (LinkedIn, Facebook, WhatsApp) -->`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:site_name" content="${esc(profile.name)}" />`,
    `<meta property="og:title" content="${esc(home.title)}" />`,
    `<meta property="og:description" content="${esc(meta.ogDescription)}" />`,
    `<meta property="og:image" content="${og}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(home.title)}" />`,
    `<meta property="og:url" content="${home.canonical}" />`,
    ``,
    `<!-- Twitter -->`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(home.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.twitterDescription)}" />`,
    `<meta name="twitter:image" content="${og}" />`,
    ``,
    `<!-- Structured data: Person (identity facts, independent of React) -->`,
    `<script type="application/ld+json">${JSON.stringify(personJsonLd())}</script>`,
  ].join("\n    ");
}
