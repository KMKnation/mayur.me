import {
  BlogCategory,
  BlogPost,
  BlogTag,
  PublicCmsData,
  SiteSettings,
} from "./types";

export const SUPER_ADMIN_EMAIL = "kanojiyamayur@gmail.com";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 1,
  siteName: "Mayur Kanojiya Portfolio",
  heroInitials: "MK",
  linkedinHandle: "linkedin.com/in/mayurkanojiya",
  profileUrl: "https://www.linkedin.com/in/mayurkanojiya/",
  resumeLabel: "PROFILE",
  resumeUrl: "https://www.linkedin.com/in/mayurkanojiya/",
  navigation: [
    { label: "ABOUT", href: "#about", type: "section", isVisible: true },
    { label: "WORK", href: "#work", type: "section", isVisible: true },
    { label: "PATENTS", href: "#patents", type: "section", isVisible: true },
    { label: "BLOG", href: "/blog", type: "route", isVisible: true },
    { label: "CONTACT", href: "#contact", type: "section", isVisible: true },
  ],
  sectionVisibility: {
    landing: true,
    about: true,
    whatIDo: true,
    career: true,
    work: true,
    patents: true,
    techstack: true,
    contact: true,
  },
  animationSettings: {
    heroEnabled: true,
    heroSpeed: 1.7,
    heroGlowIntensity: 0.6,
    cursorRepulsionRadius: 180,
    cursorRepulsionStrength: 96,
    workCardFloatSpeed: 8,
    workCardDepth: 45,
    techBallFloatSpeed: 8,
    techBallIntensity: 12,
  },
};

export const DEFAULT_CMS_CONTENT: PublicCmsData = {
  settings: DEFAULT_SITE_SETTINGS,
  sections: {
    hero: {
      greeting: "Hello! I'm",
      firstName: "MAYUR",
      lastName: "KANOJIYA",
      rolePrefix: "AI Architect &",
      rolePrimary: "LLM",
      roleSecondary: "Agents",
      taglinePrimary: "Vision",
      taglineSecondary: "Scale",
    },
    about: {
      title: "About Me",
      body:
        "I am an AI Architect at Oracle AI and ML, focused on building production-grade LLM systems, multi-agent workflows, and computer-vision solutions for enterprise use-cases. I enjoy translating complex AI ambitions into deterministic systems that scale with reliability, guardrails, and measurable impact.",
    },
    whatIDo: {
      titlePrimary: "WHAT",
      titleSecondary: "I DO",
      cards: [
        {
          title: "AI ARCHITECTURE",
          subtitle: "Deterministic LLM & Agent Systems",
          description:
            "I design enterprise AI systems that stay reliable in production, combining agent orchestration, structured output paths, and quality guardrails.",
          skills: [
            "LLMs & agent design",
            "RAG & retrieval",
            "Prompt systems",
            "Evals & guardrails",
            "Workflow orchestration",
            "Enterprise integration",
          ],
        },
        {
          title: "VISION & SCALE",
          subtitle: "Computer Vision and Edge AI Delivery",
          description:
            "I build and ship vision systems for real-world constraints, including low-latency inference, OCR pipelines, and performance-aware deployment.",
          skills: [
            "Computer vision",
            "Edge AI",
            "OpenVINO optimization",
            "Python",
            "MLOps practices",
            "Reliability engineering",
          ],
        },
      ],
    },
    career: {
      title: "My career",
      highlight: "&",
      items: [
        {
          role: "Project Lead Development",
          company: "Oracle AI and ML",
          duration: "NOW",
          description:
            "Leading AI and ML delivery with a focus on enterprise LLM systems, multi-agent architecture, and production-grade execution.",
        },
        {
          role: "Senior Application Engineer",
          company: "Oracle",
          duration: "2021–23",
          description:
            "Built and scaled enterprise applications while driving AI-ready architecture, platform reliability, and cross-functional delivery.",
        },
        {
          role: "Software Engineer",
          company: "Hidden Brains InfoTech",
          duration: "2018–21",
          description:
            "Developed full-stack solutions and contributed to production deployments across business-critical software projects.",
        },
        {
          role: "Software Developer",
          company: "iView Labs",
          duration: "2016–18",
          description:
            "Started my engineering journey building web applications and core backend features with strong execution discipline.",
        },
      ],
    },
    contact: {
      title: "Contact",
      connectTitle: "Connect",
      educationTitle: "Education",
      socialTitle: "Social",
      footerTitle: "Designed and Developed",
      footerHighlight: "Mayur Kanojiya",
      copyrightText: "2026",
      educationLines: [
        "Master's in Data Science, BITS Pilani",
        "Bachelor's in Computer Engineering",
      ],
      connectLinks: [
        {
          label: "Email — kanojiyamayur@gmail.com",
          href: "mailto:kanojiyamayur@gmail.com",
        },
        {
          label: "LinkedIn — mayurkanojiya",
          href: "https://www.linkedin.com/in/mayurkanojiya/",
        },
      ],
    },
  },
  workItems: [
    {
      id: "work-1",
      title: "Autonomous Incident Agent Team",
      category: "Multi-Agent Incident Intelligence",
      tools: "Role orchestration, escalation routing, deterministic decision paths",
      link: "https://github.com/KMKnation",
      isVisible: true,
      displayOrder: 1,
      isViewMoreTile: false,
      animationPreset: "agents",
    },
    {
      id: "work-2",
      title: "Deterministic JSON-to-Markdown Engine",
      category: "LLM Output Compiler",
      tools: "Schema alignment, low-hallucination output, UI-ready formatting",
      link: "https://github.com/KMKnation",
      isVisible: true,
      displayOrder: 2,
      isViewMoreTile: false,
      animationPreset: "compiler",
    },
    {
      id: "work-3",
      title: "Adaptive Query Radar",
      category: "Emergent Signal Detection",
      tools: "Trend clustering, alert intelligence, patent-backed architecture",
      link: "https://publish.derwent.com/d75a83e2cd2667012b5571f8f3239cb2/patent/20260087081",
      isVisible: true,
      displayOrder: 3,
      isViewMoreTile: false,
      animationPreset: "radar",
    },
    {
      id: "work-4",
      title: "Edge Vision Sentinel",
      category: "Computer Vision on Edge",
      tools: "OCR, recognition, low-latency inference, OpenVINO optimization",
      link: "https://www.linkedin.com/in/mayurkanojiya/",
      isVisible: true,
      displayOrder: 4,
      isViewMoreTile: false,
      animationPreset: "vision",
    },
    {
      id: "work-5",
      title: "Explore Complete Work Portfolio",
      category: "Case Studies and Deep Dives",
      tools: "Architecture breakdowns, execution notes, outcomes, and showcase snapshots",
      link: "/work-showcase",
      isVisible: true,
      displayOrder: 5,
      isViewMoreTile: true,
      animationPreset: "viewmore",
    },
  ],
  patentItems: [
    {
      id: "patent-1",
      title: "US Patent 12,461,979",
      type: "Granted Patent",
      summary:
        "Adaptive query intelligence for enterprise support operations, focused on identifying emergent incident patterns and response signals.",
      meta: "Granted: November 4, 2025",
      link: "https://publish.derwent.com/d75a83e2cd2667012b5571f8f3239cb2/patent/20260087081",
      isVisible: true,
      displayOrder: 1,
      isViewMoreTile: false,
      animationPreset: "granted",
    },
    {
      id: "patent-2",
      title: "Publication 20250278444",
      type: "Patent Publication",
      summary:
        "Published technical disclosure covering adaptive detection architecture, clustering, and operational escalation intelligence.",
      meta: "Publication ID: 20250278444",
      link: "https://publish.derwent.com/d75a83e2cd2667012b5571f8f3239cb2/patent/20260087081",
      isVisible: true,
      displayOrder: 2,
      isViewMoreTile: false,
      animationPreset: "publication",
    },
    {
      id: "patent-3",
      title: "Query Radar Patent Domain",
      type: "Innovation Focus",
      summary:
        "Core domain includes real-time signal extraction from support queries, anomaly surfacing, and enterprise-scale response orchestration.",
      meta: "Area: AI + Enterprise Support Intelligence",
      link: "https://publish.derwent.com/d75a83e2cd2667012b5571f8f3239cb2/patent/20260087081",
      isVisible: true,
      displayOrder: 3,
      isViewMoreTile: false,
      animationPreset: "focus",
    },
    {
      id: "patent-4",
      title: "Explore Full Patent Portfolio",
      type: "View More",
      summary:
        "Open the dedicated patent page for the complete timeline, domains, and deeper innovation notes.",
      meta: "Patent Library",
      link: "/patent-showcase",
      isVisible: true,
      displayOrder: 4,
      isViewMoreTile: true,
      animationPreset: "viewmore",
    },
  ],
  techItems: [
    { id: "tech-1", label: "React", isVisible: true, displayOrder: 1 },
    { id: "tech-2", label: "Node.js", isVisible: true, displayOrder: 2 },
    { id: "tech-3", label: "TypeScript", isVisible: true, displayOrder: 3 },
    { id: "tech-4", label: "Python", isVisible: true, displayOrder: 4 },
    { id: "tech-5", label: "LLM Systems", isVisible: true, displayOrder: 5 },
    {
      id: "tech-6",
      label: "Multi-Agent Orchestration",
      isVisible: true,
      displayOrder: 6,
    },
    {
      id: "tech-7",
      label: "Computer Vision",
      isVisible: true,
      displayOrder: 7,
    },
    { id: "tech-8", label: "OpenVINO", isVisible: true, displayOrder: 8 },
    { id: "tech-9", label: "RAG Pipelines", isVisible: true, displayOrder: 9 },
    { id: "tech-10", label: "Enterprise AI", isVisible: true, displayOrder: 10 },
    { id: "tech-11", label: "MLOps", isVisible: true, displayOrder: 11 },
    { id: "tech-12", label: "GenAI", isVisible: true, displayOrder: 12 },
  ],
  socialLinks: [
    {
      id: "social-1",
      label: "GitHub",
      url: "https://github.com/KMKnation",
      platform: "github",
      isVisible: true,
    },
    {
      id: "social-2",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/mayurkanojiya/",
      platform: "linkedin",
      isVisible: true,
    },
    {
      id: "social-3",
      label: "Email",
      url: "mailto:kanojiyamayur@gmail.com",
      platform: "email",
      isVisible: true,
    },
    {
      id: "social-4",
      label: "Patent Record",
      url: "https://publish.derwent.com/d75a83e2cd2667012b5571f8f3239cb2/patent/20260087081",
      platform: "doc",
      isVisible: true,
    },
  ],
};

export const DEFAULT_BLOG_CATEGORIES: BlogCategory[] = [
  { id: "cat-1", name: "LLM Systems", slug: "llm-systems" },
  { id: "cat-2", name: "Agent Architecture", slug: "agent-architecture" },
  { id: "cat-3", name: "Computer Vision", slug: "computer-vision" },
];

export const DEFAULT_BLOG_TAGS: BlogTag[] = [
  { id: "tag-1", name: "RAG", slug: "rag" },
  { id: "tag-2", name: "OpenVINO", slug: "openvino" },
  { id: "tag-3", name: "Prompt Engineering", slug: "prompt-engineering" },
  { id: "tag-4", name: "Evaluation", slug: "evaluation" },
];

export const DEFAULT_BLOG_POSTS: BlogPost[] = [];

