// Single source of truth for everything the site says about Harsh.
//
// Every string here was extracted verbatim from the components that were
// already rendering it on the live site (Intro, About, JobList, Projects,
// Education, Photography, Credits, certificates.js, photos.js, index.html).
// The React UI, the agent markdown view, llms.txt, the /api/*.json files,
// the JSON-LD and the sitemap are all derived from this object.
//
// Pure data only — no React, no icons — so `scripts/generate-agent-assets.mjs`
// can import it under plain Node at build time.

export const SITE_URL = "https://bafnaaharsh.netlify.app";

export const portfolio = {
  profile: {
    name: "Harsh Bafna",
    role: "Machine Learning Engineer",
    // Intro.jsx `.intro-desc`
    summary:
      "Machine learning engineer specializing in generative AI, multi-agent systems, and production-grade LLM applications. I build retrieval and analytics systems that turn messy enterprise data into useful answers.",
    // Not stated anywhere on the site — intentionally empty (see §2.3).
    location: "",
    email: "Harshbafna26@gmail.com",
    avatar: "/profile.webp",
    avatarAlt: "Harsh Bafna",
    aboutImage: "/assets/about-harsh.webp",
    aboutImageWidth: 600,
    aboutImageHeight: 600,
    aboutImageAlt: "Harsh Bafna",
    // Intro.jsx greeting pieces
    greeting: { before: "hi, ", name: "harsh", after: " here." },
  },

  // About.jsx, in display order
  about: {
    // Each paragraph is a list of segments so the React view can render the
    // inline <b> and <a> exactly as before while the markdown view joins the
    // same segments into `[text](href)`. Whitespace inside segments is
    // significant — it mirrors the original JSX byte for byte.
    paragraphs: [
      [
        { text: "I am currently a " },
        { text: "Machine Learning Engineer", bold: true },
        { text: " at" },
        { text: " Quantiphi", href: "https://quantiphi.com/" },
        {
          text:
            ", where I build generative AI, RAG, and multi-agent systems for production enterprise workflows. Previously, I worked with ",
        },
        { text: "JP Morgan Chase & Co.", href: "https://www.jpmorganchase.com/" },
      ],
      [
        {
          text:
            "I like systems that feel simple on the surface but do serious work underneath: retrieval pipelines, natural-language analytics, and AI tools that make data easier to use.",
        },
      ],
    ],
    techIntro: "Here are some technologies I have been working with:",
    techStack: ["Python", "SQL", "LangChain", "Google ADK", "Vertex AI", "FastAPI"],
  },

  links: {
    site: `${SITE_URL}/`,
    github: "https://github.com/bafnaharsh",
    linkedin: "https://linkedin.com/in/bafnaaharsh",
    resume: "/HarshBafna.pdf",
    email: "mailto:Harshbafna26@gmail.com",
    quantiphi: "https://quantiphi.com/",
    jpmorgan: "https://www.jpmorganchase.com/",
  },

  // JobList.jsx `experienceItems`, in display order
  experience: [
    {
      company: "Quantiphi",
      companyUrl: "https://quantiphi.com/",
      role: "Machine Learning Engineer",
      start: "FEB 2024",
      end: "PRESENT",
      // Not shown per job on the site — empty on purpose.
      location: "",
      bullets: [
        "Led 5+ ML engineers in a 24+ member team to ship production multi-agent systems for natural-language enterprise analytics.",
        "Architected ADK-based agents with RAG over 14+ structured data sources, including Kafka topics, Google Ads, and Google Analytics schemas.",
        "Built AI search, recommendation, campaign-generation, and lead-hotspot workflows that reduced analysis and drafting cycles from days to minutes.",
      ],
      stack: [],
      certificateSlug: null,
    },
    {
      company: "JP Morgan Chase & Co.",
      companyUrl: "https://www.jpmorganchase.com/",
      role: "Software Engineer Intern",
      start: "NOV 2022",
      end: "SEP 2023",
      location: "",
      bullets: [
        "Designed a real-time data streaming interface capable of processing 100,000+ data points per second.",
        "Used JP Morgan Chase's Perspective visualization tool to build live financial correlation graphs.",
        "Implemented upper and lower-bound indicators for real-time monitoring of stock-correlation metrics.",
      ],
      stack: [],
      // "View internship certificate" button
      certificateSlug: "jp-morgan-forage-internship",
    },
  ],

  // Projects.jsx `projects`, in display order. There are no per-project
  // pages on the site, so `links` is empty and no /projects/* route exists.
  projects: [
    {
      slug: "rca-segmentation-nl2sql-bot",
      title: "RCA, Segmentation & NL2SQL Bot",
      company: "Quantiphi",
      summary:
        "Production multi-agent analytics platform that lets business users query structured enterprise data through natural-language chat.",
      stack: ["Python", "SQL", "Google ADK", "LLMs", "RAG", "AI Agents"],
      links: {},
    },
    {
      slug: "ai-search-recommendation-engine",
      title: "AI Search & Recommendation Engine",
      company: "Quantiphi",
      summary:
        "Conversational product discovery system over an 80K+ SKU catalog, combining Vertex AI Search with recommendation models.",
      stack: ["Python", "Vertex AI Search", "LLMs", "Ranking"],
      links: {},
    },
    {
      slug: "ai-email-campaign-generator",
      title: "AI Email Campaign Generator",
      company: "Quantiphi",
      summary:
        "AI workflow that scrapes property themes and metadata, then generates polished marketing emails with enhanced imagery.",
      stack: ["Python", "LLMs", "Web Scraping", "NLP", "Imagen"],
      links: {},
    },
    {
      slug: "lead-hotspot-detection",
      title: "Lead Hotspot Detection",
      company: "Quantiphi",
      summary:
        "Hybrid ML and rules-based system for predicting lead-contamination hotspots from SDWIS public water system data.",
      stack: ["Python", "LangChain", "LLMs", "EDA", "Feature Engineering"],
      links: {},
    },
    {
      slug: "real-time-market-visualization",
      title: "Real-Time Market Visualization",
      company: "JP Morgan Chase & Co.",
      summary:
        "Streaming interface and live graphing workflow for monitoring historical stock-correlation behavior at high throughput.",
      stack: ["Perspective", "Real-Time Data Streaming", "Visualization"],
      links: {},
    },
  ],

  skills: [
    // About.jsx tech list
    { group: "Technologies", items: ["Python", "SQL", "LangChain", "Google ADK", "Vertex AI", "FastAPI"] },
    // index.html JSON-LD `knowsAbout`
    {
      group: "Areas",
      items: [
        "Machine Learning",
        "Generative AI",
        "Large Language Models",
        "Retrieval-Augmented Generation",
        "Multi-Agent Systems",
      ],
    },
  ],

  // Education.jsx `educationItems`
  education: [
    {
      institution: "B.M.S. College of Engineering",
      location: "Bangalore, India",
      qualification: "Bachelor of Engineering, Electronics & Instrumentation Engineering",
      detail: "GPA: 8.3/10",
      start: "2020",
      end: "2024",
    },
    {
      institution: "S.Tech IT School",
      location: "Rajasthan, India",
      qualification: "Higher Secondary School Certificate, PCM",
      detail: "Percentage: 82.6%",
      start: "2019",
      end: "2020",
    },
  ],

  // certificates.js — slug is the /certificate/<slug> route, file the PDF.
  certifications: [
    { slug: "google-cloud-engineer", name: "Associate Cloud Engineer", issuer: "Google Cloud", file: "/certs/google-cloud-engineer.pdf" },
    { slug: "google-ml-engineer", name: "Professional ML Engineer", issuer: "Google Cloud", file: "/certs/google-ml-engineer.pdf" },
    { slug: "jp-morgan-forage-internship", name: "JP Morgan Forage Internship", issuer: "JP Morgan Chase & Co.", file: "/certs/jp%20morgan%20forage%20internship.pdf" },
    { slug: "one-for-all", name: "One for All", issuer: "Quantiphi", file: "/certs/one-for-all.pdf" },
    { slug: "think-tank", name: "Think Tank", issuer: "Quantiphi", file: "/certs/think-tank.pdf" },
    { slug: "consider-it-done", name: "Consider It Done", issuer: "Quantiphi", file: "/certs/consider-it-done.pdf" },
  ],

  // Photography.jsx / photos.js
  photography: {
    description:
      "A small collection of photos, gathered from travel, streets, and quiet everyday frames.",
    photos: [
      { src: "/assets/photography/kediler.webp", title: "street cats", width: 671, height: 1200 },
      { src: "/assets/photography/IMG_20210428_183550.webp", title: "evening frame", width: 1197, height: 1600 },
      { src: "/assets/photography/IMG_20210420_100741_174.webp", title: "open sky", width: 720, height: 1280 },
      { src: "/assets/photography/IMG_20210409_171430.webp", title: "quiet corner", width: 907, height: 1600 },
      { src: "/assets/photography/IMG_20210329_082927_984.webp", title: "morning light", width: 1280, height: 612 },
      { src: "/assets/photography/1000014681~3.webp", title: "city texture", width: 1205, height: 1600 },
    ],
  },

  // Credits.jsx
  credits: ["Built and designed by Harsh Bafna. ", "All rights reserved. ©"],

  // index.html <head>
  meta: {
    title: "Harsh Bafna — Machine Learning Engineer",
    description:
      "Harsh Bafna is a Machine Learning Engineer specializing in generative AI, multi-agent systems, and production-grade LLM applications.",
    ogDescription:
      "Generative AI, multi-agent systems, and production-grade LLM applications. I build retrieval and analytics systems that turn messy enterprise data into useful answers.",
    twitterDescription:
      "Generative AI, multi-agent systems, and production-grade LLM applications.",
    keywords:
      "Harsh Bafna, Machine Learning Engineer, Generative AI, LLM, RAG, Multi-Agent Systems, Vertex AI, Quantiphi, AI Portfolio",
    themeColor: "#0a192f",
    worksFor: "Quantiphi",
  },
};

// ---------------------------------------------------------------------------
// Derived helpers shared by the UI and the build script.
// ---------------------------------------------------------------------------

export const getCertificateBySlug = (slug) =>
  portfolio.certifications.find((c) => c.slug === slug);

/** Every real, indexable route on the site, derived from the data. */
export const routes = () => [
  { path: "/", changefreq: "monthly", priority: "1.0" },
  { path: "/photography", changefreq: "monthly", priority: "0.6" },
  { path: "/resume", changefreq: "monthly", priority: "0.8" },
  ...portfolio.certifications.map((c) => ({
    path: `/certificate/${c.slug}`,
    changefreq: "yearly",
    priority: c.issuer === "Google Cloud" ? "0.5" : "0.4",
  })),
];
