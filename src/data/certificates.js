import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { portfolio } from "./portfolio";

// UI-only decoration for each certificate. The data itself (slug, title,
// issuer, file) lives in portfolio.js so the agent view, llms.txt and the
// JSON endpoints can share it.
const ICONS = {
  "google-cloud-engineer": CloudRoundedIcon,
  "google-ml-engineer": PsychologyRoundedIcon,
  "jp-morgan-forage-internship": EmojiEventsRoundedIcon,
  "one-for-all": EmojiEventsRoundedIcon,
  "think-tank": LightbulbRoundedIcon,
  "consider-it-done": CheckCircleRoundedIcon,
};

// `slug` is the URL segment for the shareable route ({site}/certificate/<slug>)
// and `file` is the static PDF served from /public/certs.
export const certificates = portfolio.certifications.map((cert) => ({
  slug: cert.slug,
  title: cert.name,
  issuer: cert.issuer,
  file: cert.file,
  icon: ICONS[cert.slug] ?? EmojiEventsRoundedIcon,
}));

// Look up a certificate by its URL slug. Returns undefined when not found.
export const getCertificateBySlug = (slug) =>
  certificates.find((cert) => cert.slug === slug);
