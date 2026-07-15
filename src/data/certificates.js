import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

// Single source of truth for certificates. The `slug` is the URL segment used
// for the shareable route ({site}/certificate/<slug>), and `file` is the static PDF
// served from /public/certs. Both the homepage pills and the standalone
// /certificate/:slug page read from this list.
export const certificates = [
  {
    slug: "google-cloud-engineer",
    title: "Associate Cloud Engineer",
    issuer: "Google Cloud",
    file: "/certs/google-cloud-engineer.pdf",
    icon: CloudRoundedIcon,
  },
  {
    slug: "google-ml-engineer",
    title: "Professional ML Engineer",
    issuer: "Google Cloud",
    file: "/certs/google-ml-engineer.pdf",
    icon: PsychologyRoundedIcon,
  },
  {
    slug: "jp-morgan-forage-internship",
    title: "JP Morgan Forage Internship",
    issuer: "JP Morgan Chase & Co.",
    file: "/certs/jp%20morgan%20forage%20internship.pdf",
    icon: EmojiEventsRoundedIcon,
  },
  {
    slug: "one-for-all",
    title: "One for All",
    issuer: "Quantiphi",
    file: "/certs/one-for-all.pdf",
    icon: EmojiEventsRoundedIcon,
  },
  {
    slug: "think-tank",
    title: "Think Tank",
    issuer: "Quantiphi",
    file: "/certs/think-tank.pdf",
    icon: LightbulbRoundedIcon,
  },
  {
    slug: "consider-it-done",
    title: "Consider It Done",
    issuer: "Quantiphi",
    file: "/certs/consider-it-done.pdf",
    icon: CheckCircleRoundedIcon,
  },
];

// Look up a certificate by its URL slug. Returns undefined when not found.
export const getCertificateBySlug = (slug) =>
  certificates.find((cert) => cert.slug === slug);
