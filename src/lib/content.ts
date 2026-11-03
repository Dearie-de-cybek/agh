/**
 * Homepage copy and destinations — transcribed from the live aghcloud.ai
 * homepage and its nav bundle. Nothing here is new product claim.
 * Items marked VERIFY are existing claims the founders should confirm
 * (also listed in NOTES.md).
 */

export type NavGroup = {
  label: string;
  /** destination of the lead panel in the open menu */
  href: string;
  leadTitle: string;
  blurb: string;
  items: { label: string; href: string; external?: boolean; badge?: string }[];
};

/**
 * One consolidated primary navigation. Every destination from the previous
 * two-row header is kept: the old utility row (About, Africa AI Innovation,
 * Africa AI Challenge, Philanthropy, Impact Stories, Cloud Management,
 * AI Models) now lives inside the menus or as a header action, and "Home" is
 * the logo.
 */
export const NAV_MAIN: NavGroup[] = [
  {
    label: "Solutions",
    href: "/solutions",
    leadTitle: "GPU Solutions",
    blurb: "Explore our comprehensive GPU rental and AI infrastructure services.",
    items: [
      { label: "Rent GPUs", href: "/cloud-dashboard" },
      { label: "Buy GPU systems", href: "/hardware-market" },
      { label: "Cluster / AI consulting", href: "/solutions" },
      { label: "GPU Estimator", href: "/gpu-estimator" },
      { label: "Use Wizard", href: "/gpu-wizard" },
      { label: "Interactive Demo", href: "/ai-demo" },
      { label: "App Store", href: "/app-store", badge: "New" },
    ],
  },
  {
    label: "Packages",
    href: "/packages/creative-suite",
    leadTitle: "Packages",
    blurb: "Ready-made building blocks for sovereign AI.",
    items: [
      { label: "Private AI", href: "/private-ai" },
      { label: "Africa AI", href: "/africa-ai" },
      { label: "AGH Creative Suite", href: "/packages/creative-suite" },
      { label: "AI Agents SecurePod", href: "/securepod" },
    ],
  },
  {
    label: "AI",
    href: "/ai-possibilities",
    leadTitle: "AI Possibilities",
    blurb: "Discover how AI is transforming key sectors across the African continent.",
    items: [
      { label: "AI Possibilities", href: "/ai-possibilities" },
      { label: "AI Models", href: "/ai-models" },
    ],
  },
  {
    label: "Partners",
    href: "/partners",
    leadTitle: "Solution Partners",
    blurb: "Certified partners delivering enterprise and government-grade AI.",
    items: [
      { label: "Find Partners", href: "/partners" },
      { label: "Partner Portal", href: "/solution-partner-dashboard" },
    ],
  },
  {
    label: "Africa",
    href: "/about",
    leadTitle: "About AGH",
    blurb: "Accelerating AI innovation across Africa through accessible, high-performance GPU infrastructure.",
    items: [
      { label: "About", href: "/about" },
      { label: "Africa AI Innovation", href: "/africa-ai-innovation" },
      { label: "Africa AI Challenge", href: "/africa-ai-challenge" },
      { label: "Philanthropy", href: "/philanthropy" },
    ],
  },
  {
    label: "Stories",
    href: "/success-stories",
    leadTitle: "Stories & Insights",
    blurb: "Real customer wins and articles from our partner network.",
    items: [
      { label: "Impact Stories", href: "/impact-stories" },
      { label: "Success Stories", href: "/success-stories" },
      { label: "Partner Blogs", href: "https://udutech.co/blog", external: true },
    ],
  },
];

export const AUTH = { signIn: "/login", signUp: "/signup", cloud: "/cloud-dashboard" };

export const HERO = {
  tag: "Sovereign AI Cloud",
  title: "Sovereign AI starts here.",
  body: "Build, deploy, and govern AI on your terms — secure pods, private compute, global GPUs, and full control of your models, agents, and data.",
  statement: ["Your cloud.", "Your agents.", "Your GPUs.", "Unlimited innovation."],
  primary: { label: "Cloud Management", href: "/cloud-dashboard" },
  secondary: { label: "Try AI", href: "#ai-trial" },
};

export const MODELS = {
  eyebrow: "Culture-tuned models",
  title: "Try our culture-tuned AI models — free, no account needed",
  // The live site renders "{limit} free questions" from /api/trial/status.
  body: (limit: number) =>
    `Mistral, DeepSeek, African language models, and more — hosted on our own GPUs. Ask ${limit} free questions and see the difference.`,
  frontierPerMillion: 10, // VERIFY: "GPT typically ~$10 / million tokens" is AGH's own stated figure
  claims: [
    {
      key: "cheaper",
      title: "5–10x cheaper than frontier models", // VERIFY: see pricing note in NOTES.md
      body: "Frontier models like GPT typically cost around $10 per million tokens.",
    },
    {
      key: "correct",
      title: "2–3x more correct in their specialty", // VERIFY: no benchmark source on site
      body: "Culture-tuned models are trained for their domains — African languages, local context, and regional knowledge — delivering 2–3x more correct answers in their specialty than general-purpose models.",
    },
    {
      key: "sovereign",
      title: "Hosted on sovereign GPUs", // VERIFY: "prompts never leave the platform"
      body: "Every answer is served from GPU infrastructure we operate — your prompts never leave the platform.",
    },
  ],
};

export const BELIEF = {
  eyebrow: "What we believe",
  title: "Impact on the world",
  paras: [
    "The world's AI future is being shaped by a handful of companies with massive compute. We believe every nation, enterprise, and creator deserves the power to build securely, privately, and independently.",
    "AGH exists to make sovereign, secure, and affordable AI available to everyone — from global enterprises to students in villages without internet. We innovate relentlessly to drive the cost of AI down, so billions of people can access the tools that shape their future.",
  ],
  closing:
    "From secure AI agent pods to private national GPU infrastructure, AGH gives you the power to own your models, your data, and your destiny.",
  provides: [
    "Secure AI agent pods",
    "Private national GPU infrastructure",
    "Ownership of AI models",
    "Ownership of data",
    "Technological independence",
  ],
};

export const PACKAGES = {
  eyebrow: "Featured packages",
  title: "Everything you need to build sovereign AI",
  body: "From secure agent pods to national GPU infrastructure — pick the building blocks for your AI future.",
  items: [
    {
      key: "pods",
      title: "Secure AI Agent Pods",
      body: "Run agents, browsers, and workloads inside zero‑trust, isolated compute pods.",
      cta: "Launch Secure Pod",
      href: "/securepod",
    },
    {
      key: "gpu",
      title: "Private GPU Infrastructure",
      body: "Deploy sovereign, on‑prem, or hybrid GPU clusters for your business or country.",
      cta: "GPU Marketplace",
      href: "/hardware-market",
    },
    {
      key: "apps",
      title: "AI App Store & Creative Suite",
      body: "Instantly deploy open‑source models, creative tools, and AI apps on your own compute.",
      cta: "Explore Apps",
      href: "/app-store",
    },
    {
      key: "partners",
      title: "Solution Partner Network",
      body: "Certified partners delivering enterprise and government‑grade AI solutions.",
      cta: "Find a Partner",
      href: "/partners",
    },
    {
      key: "credits",
      title: "AI Credit Programs",
      body: "Enable organizations or governments to distribute GPU credits to builders in minutes — powering innovation at scale.",
      cta: "Philanthropy & Programs",
      href: "/philanthropy",
    },
  ],
};

export const TRUSTED = {
  title: "Trusted by innovators worldwide",
  // VERIFY each relationship. `logo` stays empty until approved brand files
  // are supplied — logos are never recreated. Names render as typeset text,
  // exactly as the live site does today.
  orgs: [
    { name: "Afrilab", logo: "" },
    { name: "Terra Industries", logo: "" },
    { name: "Strathmore University", logo: "" },
    { name: "Octopus", logo: "" },
    { name: "Gates Foundation", logo: "" },
    { name: "UNDP", logo: "" },
  ],
};

export const CTA = {
  title: "Own your AI future.",
  body: "Start in minutes with secure pods and on‑demand GPUs — or talk to us about sovereign, national‑scale deployments.",
  primary: { label: "Get Started", href: "/cloud-dashboard" },
  secondary: { label: "Talk to Sales", href: "/about" },
};

export const FOOTER = {
  brand: "Africa GPU Hub",
  blurb: "Accelerating AI innovation across Africa through accessible, high-performance GPU infrastructure.",
  columns: [
    {
      title: "Solutions",
      links: [
        { label: "GPU Rental", href: "/solutions" },
        { label: "AI GPU Marketplace", href: "/solutions" },
        { label: "Datacenter Consulting", href: "/solutions" },
        { label: "AI Software Consulting", href: "/solutions" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "GPU Estimator", href: "/gpu-estimator" },
        { label: "API Documentation", href: "/docs/api" },
        { label: "API Reference", href: "/docs/api" },
        { label: "Community Forum", href: "#" }, // existing placeholder href
        { label: "Support Center", href: "#" },
        { label: "Status Page", href: "#" },
        { label: "Future blogs", href: "/blogs" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#" }, // existing placeholder href
        { label: "Careers", href: "#" },
        { label: "Press", href: "#" },
        { label: "Contact", href: "#" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
      ],
    },
  ],
  legal: "© 2026 UduTech. All rights reserved.",
  badges: ["Proudly African", "Powered by Renewable Energy"], // VERIFY renewable-energy claim
};
