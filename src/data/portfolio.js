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
    // public/HarshBafna.pdf — Experience block ("Bengaluru, IN")
    location: "Bengaluru, India",
    // public/HarshBafna.pdf — Professional Summary
    resumeSummary:
      "Machine Learning Engineer with ~3 years of experience specializing in Generative AI, multi-agent orchestration, MLOps, and enterprise cloud architecture on GCP. Proven track record of architecting scalable retrieval systems (RAG), and deploying microservices-backed production AI platforms for enterprise data analytics.",
    // index.html JSON-LD `knowsAbout`
    knowsAbout: [
      "Machine Learning",
      "Generative AI",
      "Large Language Models",
      "Retrieval-Augmented Generation",
      "Multi-Agent Systems",
    ],
    email: "harshbafna29@gmail.com",
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
    email: "mailto:harshbafna29@gmail.com",
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
      // public/HarshBafna.pdf
      location: "Bengaluru, India",
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
      // public/HarshBafna.pdf
      location: "Remote",
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
      // public/HarshBafna.pdf — project block under Quantiphi
      resumeTags: ["AI Agents", "ADK", "BigQuery", "Apache Kafka", "RAG", "Multi Agent Orchestration"],
      details: [
        "Led a team of 5+ ML engineers within a 24+ member engineering group to design and ship 3 production-grade multi-agent orchestration systems, enabling executive teams to query enterprise metrics via natural language.",
        "Architected an agentic analytics platform utilizing Google Agent Development Kit (ADK) with a custom RAG retrieval engine indexing schemas across 14+ structured data sources (Kafka topics, Google Ads, BigQuery) for precise NL2SQL synthesis.",
        "Cut executive and management data-reporting turnaround time from days to under 2 minutes, accelerating decision-making velocity across business units.",
      ],
    },
    {
      slug: "ai-search-recommendation-engine",
      title: "AI Search & Recommendation Engine",
      company: "Quantiphi",
      summary:
        "Conversational product discovery system over an 80K+ SKU catalog, combining Vertex AI Search with recommendation models.",
      stack: ["Python", "Vertex AI Search", "LLMs", "Ranking"],
      links: {},
      resumeTags: ["Vertex AI Search", "Dynamic Model Swap", "Ranking", "Keyword Extraction"],
      details: [
        "Architected a real-time conversational search and recommendation engine, replacing legacy fuzzy keyword matching with intent-aware semantic vector retrieval.",
        "Engineered a high-throughput search platform using Vertex AI Search for Commerce, indexing a 1.5M+ SKU product catalog and implementing custom ranking models (frequently-bought-together, similar items, personalized scoring).",
        "Increased catalog discovery accuracy and user engagement by aligning free-form natural language queries directly to product vector spaces.",
      ],
    },
    {
      slug: "ai-email-campaign-generator",
      title: "AI Email Campaign Generator",
      company: "Quantiphi",
      summary:
        "AI workflow that scrapes property themes and metadata, then generates polished marketing emails with enhanced imagery.",
      stack: ["Python", "LLMs", "Web Scraping", "NLP", "Imagen"],
      links: {},
      resumeTags: ["Agentic Workflows", "Imagen", "Cloud Run", "Web Scraping"],
      details: [
        "Built an automated multimodal marketing workflow that extracts brand aesthetics and metadata from target web domains to generate custom email assets.",
        "Engineered headless scraping pipelines (Playwright) to extract design assets, feeding structured contextual prompts into Gemini and Imagen models deployed on Cloud Run for dynamic asset generation.",
        "Reduced marketing campaign creation cycles from weeks to under 5 minutes by completely automating asset extraction and copy generation.",
      ],
    },
    {
      slug: "lead-hotspot-detection",
      title: "Lead Hotspot Detection",
      company: "Quantiphi",
      summary:
        "Hybrid ML and rules-based system for predicting lead-contamination hotspots from SDWIS public water system data.",
      stack: ["Python", "LangChain", "LLMs", "EDA", "Feature Engineering"],
      links: {},
      resumeTags: ["Hybrid Predictive Model", "SDWIS Database", "Geospatial Feature Engineering"],
      details: [
        "Engineered machine learning pipelines to predict municipal lead contamination risks across regional drinking water systems.",
        "Preprocessed and engineered spatial features from Public Water System (PWS) datasets sourced from the EPA SDWIS database, implementing hybrid XGBoost and heuristic rule-based decision trees.",
        "Achieved 88+% predictive accuracy for lead hotspot identification, directly optimizing resource allocation for infrastructure remediation teams.",
      ],
    },
    {
      slug: "real-time-market-visualization",
      title: "Real-Time Market Visualization",
      company: "JP Morgan Chase & Co.",
      summary:
        "Streaming interface and live graphing workflow for monitoring historical stock-correlation behavior at high throughput.",
      stack: ["Perspective", "Real-Time Data Streaming", "Visualization"],
      links: {},
      resumeTags: [],
      details: [
        "Engineered a real-time financial streaming interface capable of ingesting and processing over 100,000 data points/second with minimal latency.",
        "Utilized JP Morgan's Perspective open-source data engine to construct dynamic visualization dashboards monitoring historical stock pair correlations.",
        "Implemented automated bound-crossing alert triggers based on statistical correlation metrics to support real-time quantitative monitoring.",
      ],
    },
  ],

  // public/HarshBafna.pdf — Technical Skills, verbatim groups
  skills: [
    {
      group: "Programming & Core CS",
      items: ["Python", "C/C++", "Java", "SQL", "Bash / Shell Scripting", "Object-Oriented Programming (OOP)"],
    },
    {
      group: "Generative AI & Agentic Systems",
      items: [
        "Google Agent Development Kit (ADK)", "LLMs", "Multi-Agent Orchestration", "Retrieval-Augmented Generation (RAG)",
        "Model Context Protocol (MCP)", "LangChain", "LangGraph", "Prompt Engineering", "Vector Search", "Hybrid Search",
        "Embeddings", "Fine-Tuning", "PEFT/LoRA", "AI Guardrails", "Nvidia NeMo",
      ],
    },
    {
      group: "Machine Learning & Data Science",
      items: [
        "Neural Networks", "PyTorch", "TensorFlow", "Scikit-Learn", "XGBoost", "LightGBM", "Pandas", "NumPy", "OpenCV",
        "Natural Language Processing (NLP)", "Computer Vision", "Feature Engineering", "Exploratory Data Analysis (EDA)",
        "Time-Series Forecasting",
      ],
    },
    {
      group: "GCP, Cloud & Infrastructure",
      items: [
        "Google Cloud Platform (GCP)", "Vertex AI", "Search/Recommendation Models", "Cloud Run/AWS Lambda", "Cloud Functions",
        "Google Cloud Storage (GCS)", "Firebase", "Pub/Sub", "AWS", "Azure", "Docker", "Kubernetes", "DevOps", "Linux",
      ],
    },
    {
      group: "Data Engineering & Architecture",
      items: [
        "BigQuery", "Data Warehousing", "Apache Kafka", "Snowflake", "PostgreSQL", "MongoDB", "MySQL", "Redis", "NoSQL",
        "Vector Databases", "Data Pipelines", "Microservices", "REST APIs", "FastAPI", "Backend Architecture",
        "Full-Stack Integration", "System Design",
      ],
    },
    {
      group: "MLOps, Web & Tools",
      items: ["CI/CD", "MLflow", "Hugging Face", "Model Deployment", "Streamlit", "Git", "GitHub", "Document AI", "Agile Methodologies"],
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
