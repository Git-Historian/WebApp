import { transformData } from "./data";
import type { TimelineData } from "./types";

const RAW_SAMPLE_DATA: TimelineData = [
  {
    name: "Project Init",
    year: 2024,
    degree: 0,
    variant: "large",
    title: "Repository created with Vite + React + TypeScript",
    narrative:
      "The foundation was laid with a modern frontend stack. Vite was chosen for its blazing fast HMR, React for component architecture, and TypeScript for type safety. This decision would shape everything that followed.",
    category: "foundation",
    commits: [
      {
        hash: "a1b2c3d",
        author: "Edward Guillen",
        date: "2024-01-15",
        message: "Initial commit: Vite + React + TypeScript scaffold",
        insertions: 847,
        deletions: 0,
      },
    ],
  },
  {
    name: "Design System",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "CSS custom properties and theming infrastructure",
    narrative:
      "A comprehensive design system emerged with CSS custom properties for colors, typography, and spacing. Dark mode was implemented via data-theme attributes, establishing the visual language for the entire portfolio.",
    category: "design",
    commits: [
      {
        hash: "d4e5f6g",
        author: "Edward Guillen",
        date: "2024-02-03",
        message: "Add design tokens and CSS custom properties",
        insertions: 312,
        deletions: 45,
      },
    ],
  },
  {
    name: "Home Page",
    year: 2024,
    degree: 0,
    variant: "large",
    title: "Landing page with hero animation",
    narrative:
      "The home page took shape with a bold hero section, stagger animations on load, and a carefully crafted first impression. GSAP powered the entrance choreography while Framer Motion handled interactive states.",
    category: "feature",
  },
  {
    name: "Case Studies",
    year: 2024,
    degree: 0,
    variant: "large",
    title: "Slide-based case study architecture",
    narrative:
      "An innovative slide-based architecture was introduced for case studies. Each case study became a full-screen presentation with keyboard and scroll navigation, minimap dots, and smooth transitions between slides.",
    category: "architecture",
    commits: [
      {
        hash: "h7i8j9k",
        author: "Edward Guillen",
        date: "2024-03-20",
        message: "Implement slide-based case study framework",
        insertions: 1247,
        deletions: 89,
      },
      {
        hash: "l0m1n2o",
        author: "Edward Guillen",
        date: "2024-03-22",
        message: "Add keyboard navigation and minimap",
        insertions: 456,
        deletions: 23,
      },
    ],
  },
  {
    name: "Luma Study",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "First case study: Luma design system",
    narrative:
      "The Luma case study was the first to use the new slide architecture, showcasing design system work with rich visuals and interactive components.",
    category: "content",
  },
  {
    name: "Prudential",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "Enterprise design case study",
    narrative:
      "A deep dive into enterprise-scale design challenges at Prudential, demonstrating the ability to navigate complex stakeholder environments.",
    category: "content",
  },
  {
    name: "Multi-Page",
    year: 2024,
    degree: 0,
    variant: "large",
    title: "Migration from SPA to MPA with Vite",
    narrative:
      "A significant architectural shift from single-page to multi-page app. Each case study got its own HTML entry point, improving initial load performance and SEO while maintaining the rich interaction model.",
    category: "architecture",
    architectureNote:
      "Moved from SPA with React Router to Vite MPA with rollupOptions.input entries per page.",
    complexityDelta: -12,
  },
  {
    name: "About Page",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "Personal about page with biography",
    category: "content",
  },
  {
    name: "Theme Toggle",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "Dark/light mode toggle with sound",
    narrative:
      "A polished theme toggle with magnetic snap sound effect, smooth transitions, and localStorage persistence. The toggle became a signature interaction element.",
    category: "interaction",
    commits: [
      {
        hash: "p3q4r5s",
        author: "Edward Guillen",
        date: "2024-07-10",
        message: "Replace theme toggle sound with magnetic snap effect",
        insertions: 78,
        deletions: 45,
      },
    ],
  },
  {
    name: "UI Sounds",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "Web Audio API sound effects system",
    narrative:
      "A comprehensive sound system was added using the Web Audio API. No audio files, everything synthesized at runtime using oscillators and filtered noise. Subtle clicks, swooshes, and pops gave the interface tactile feedback.",
    category: "interaction",
    architectureNote:
      "Pure Web Audio API implementation in src/utils/sounds.js. Zero audio file dependencies.",
    commits: [
      {
        hash: "t6u7v8w",
        author: "Edward Guillen",
        date: "2025-01-05",
        message: "Add subtle UI sounds via Web Audio API",
        insertions: 234,
        deletions: 0,
      },
      {
        hash: "x9y0z1a",
        author: "Edward Guillen",
        date: "2025-01-06",
        message: "Add slide navigation sounds to all case studies",
        insertions: 167,
        deletions: 12,
      },
    ],
  },
  {
    name: "OnOctave",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Music platform case study",
    category: "content",
  },
  {
    name: "SponsorBase",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Sponsorship platform case study",
    category: "content",
  },
  {
    name: "Smooth Scroll",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Lenis smooth scrolling on mobile",
    narrative:
      "Lenis was integrated for butter-smooth scrolling on mobile devices, completing the native-feel experience across all platforms.",
    category: "performance",
  },
  {
    name: "SEO + Sitemap",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Comprehensive sitemap and meta tags",
    category: "infrastructure",
    commits: [
      {
        hash: "b2c3d4e",
        author: "Edward Guillen",
        date: "2025-02-01",
        message: "Update sitemap with all pages, articles, and trailing slashes",
        insertions: 45,
        deletions: 12,
      },
    ],
  },
  {
    name: "Portfolio Compass",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "AI-powered design direction tool",
    narrative:
      "The most technically ambitious case study: an AI-powered tool that helps designers find their creative direction. This marked the portfolio's evolution from static showcase to interactive product demonstrations.",
    category: "feature",
  },
];

export const SAMPLE_DATA = transformData([...RAW_SAMPLE_DATA]);
