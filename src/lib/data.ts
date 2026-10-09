export type Project = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  metrics: { label: string; value: string }[];
  repo: string;
  demo?: string;
  accent: string;
  year: string;
};

export const projects: Project[] = [
  {
    id: "central-laundry",
    title: "Central Laundry Express",
    subtitle: "Commercial Laundry Operations & Responsive Web Platform",
    description:
      "Spearheaded the engineering of a commercial laundry web platform in Purbalingga featuring WhatsApp online booking, pickup & delivery scheduling, responsive price catalog, and high-conversion UI/UX.",
    tech: ["Next.js", "React", "TypeScript", "TailwindCSS", "WhatsApp API", "Figma"],
    metrics: [
      { label: "Role", value: "Lead Developer & UI/UX" },
      { label: "Deployment", value: "Production Live" },
      { label: "Target stack", value: "Next.js & Tailwind" },
    ],
    repo: "https://github.com/wewolk/compro-laundry-central",
    demo: "https://www.centrallaundryexpress.com/",
    accent: "from-cyan-500 via-sky-500 to-indigo-500",
    year: "2026",
  },
  {
    id: "management-ternak",
    title: "TernakPro - Sistem Manajemen Ternak",
    subtitle: "Cloud Livestock Management & Barcode Tracking System",
    description:
      "Engineered a digital farm operations platform featuring automated QR/barcode animal identification, health & vaccination history, feed inventory monitoring, and growth analytics.",
    tech: ["Next.js", "React", "TypeScript", "TailwindCSS", "Vercel", "Data Viz"],
    metrics: [
      { label: "Platform", value: "Web Application" },
      { label: "Deployment", value: "Vercel Cloud" },
      { label: "Key Tech", value: "Barcode & Analytics" },
    ],
    repo: "https://github.com/SiNopaal",
    demo: "https://managementternak.vercel.app/",
    accent: "from-emerald-500 via-teal-500 to-cyan-500",
    year: "2025 – 2026",
  },
  {
    id: "patukrejomulyo-egov",
    title: "Patukrejomulyo E-Gov Incident Platform",
    subtitle: "Civic Public Incident Management & Spatial Mapping",
    description:
      "Engineered an official civic reporting web dashboard for public infrastructure damage with Google Maps spatial clustering and AI incident triage, accelerating official resolution response times by 50%.",
    tech: ["Next.js App Router", "NestJS", "PostgreSQL", "Google Maps API", "TailwindCSS"],
    metrics: [
      { label: "QA Pass Rate", value: "100% Pass" },
      { label: "Test Scenarios", value: "32 Scenarios" },
      { label: "Triage Speed", value: "50% Faster" },
    ],
    repo: "https://github.com/SiNopaal",
    demo: "https://www.patukrejomulyo.web.id/",
    accent: "from-indigo-600 via-violet-500 to-blue-500",
    year: "2024",
  },
];

export type TechItem = {
  name: string;
  category: "Frontend" | "AI & Bots" | "UI/UX" | "Backend" | "Cloud & DevOps";
  color: string;
};

export const techStack: TechItem[] = [
  // Frontend
  { name: "React", category: "Frontend", color: "#61dafb" },
  { name: "Next.js (App Router)", category: "Frontend", color: "#ffffff" },
  { name: "TypeScript", category: "Frontend", color: "#3178c6" },
  { name: "TailwindCSS", category: "Frontend", color: "#38bdf8" },
  { name: "JavaScript (ES6+)", category: "Frontend", color: "#f7df1e" },
  { name: "Flutter", category: "Frontend", color: "#02569b" },
  { name: "HTML5/CSS3", category: "Frontend", color: "#e34f26" },

  // AI & Bots
  { name: "LLM APIs", category: "AI & Bots", color: "#74aa9c" },
  { name: "Python Scripting", category: "AI & Bots", color: "#ffd343" },
  { name: "Node.js Bots", category: "AI & Bots", color: "#68a063" },
  { name: "Prompt Engineering", category: "AI & Bots", color: "#818cf8" },
  { name: "Webhook Handlers", category: "AI & Bots", color: "#34d399" },
  { name: "Function Calling", category: "AI & Bots", color: "#38bdf8" },

  // UI/UX
  { name: "Figma", category: "UI/UX", color: "#f24e1e" },
  { name: "Design Systems", category: "UI/UX", color: "#ff7262" },
  { name: "Interactive Prototyping", category: "UI/UX", color: "#a259ff" },
  { name: "User Journey Maps", category: "UI/UX", color: "#1abcfe" },
  { name: "BRD / SRS Docs", category: "UI/UX", color: "#0acf83" },

  // Backend
  { name: "NestJS", category: "Backend", color: "#ea2845" },
  { name: "Laravel", category: "Backend", color: "#ff2d20" },
  { name: "PostgreSQL", category: "Backend", color: "#336791" },
  { name: "MySQL", category: "Backend", color: "#00758f" },
  { name: "RESTful APIs", category: "Backend", color: "#5ac5c9" },

  // Cloud & DevOps
  { name: "Vercel", category: "Cloud & DevOps", color: "#ffffff" },
  { name: "Railway", category: "Cloud & DevOps", color: "#0b0d0e" },
  { name: "Neon DB", category: "Cloud & DevOps", color: "#00e699" },
  { name: "Git & GitHub", category: "Cloud & DevOps", color: "#2088ff" },
  { name: "Postman", category: "Cloud & DevOps", color: "#ff6c37" },
  { name: "Linux / Bash", category: "Cloud & DevOps", color: "#fcc624" },
];

export const categories = [
  "Frontend",
  "AI & Bots",
  "UI/UX",
  "Backend",
  "Cloud & DevOps",
] as const;

export const timeline = [
  {
    year: "2022",
    title: "Started Software Engineering",
    description:
      "Entered Telkom University Purwokerto — studying web programming, algorithms, database systems, and human-computer interaction (HCI).",
  },
  {
    year: "2024",
    title: "Patukrejomulyo E-Gov Platform & QA Lead",
    description:
      "Engineered an administrative dashboard for public facility incident tracking with Google Maps API and executed Black Box testing with 100% pass rate.",
  },
  {
    year: "2024 – 2026",
    title: "AI Bot Scripting & Automation Labs",
    description:
      "Explored and deployed automated background bot scripts in Python and Node.js with LLM APIs for autonomous data processing and event dispatching.",
  },
  {
    year: "2025",
    title: "UI/UX Designer Intern at PT Seven Inc",
    description:
      "Crafted production Figma UI/UX for Titik Visual (scaled to 13+ responsive pages) and conceptualized 4-role user flows for the Nebeng ride-sharing platform.",
  },
  {
    year: "2026",
    title: "Project Lead & Commercial Client Delivery",
    description:
      "Directed engineering and design delivery for the Commercial Laundry Suite (Londri-Admin dashboard and Laundry Central commercial profile).",
  },
];

export const socials = {
  website: "https://naufalmauu.software",
  email: "mailto:naufalmaulana806@gmail.com",
  github: "https://github.com/SiNopaal",
  linkedin: "https://www.linkedin.com/in/naufalmaulanaizzuddin",
  whatsapp: "https://wa.me/6285770266735",
  cv: "/Resume-Naufal-Maulana.html",
};
