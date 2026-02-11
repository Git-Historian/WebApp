import { transformData } from "./data";
import type { TimelineData } from "./types";

export interface DemoRepo {
  slug: string;
  label: string;
  repoName: string;
  description: string;
  timeline: TimelineData;
}

// ─── Edward's Portfolio ──────────────────────────────────────────────
const PORTFOLIO_RAW: TimelineData = [
  {
    name: "Project Init",
    year: 2024,
    degree: 0,
    variant: "large",
    title: "Repository created with Vite + React + TypeScript",
    narrative:
      "Day zero. A single `npm create vite` command and a mass-deletion of boilerplate. Nothing screams 'I have a vision' quite like nuking the default CSS within four minutes of scaffold.",
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
      "Before writing a single component, 47 CSS custom properties were declared. Some devs call it over-engineering. Edward calls it 'not hating yourself in three months.'",
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
      "The home page arrived with a hero section that makes you forget you're looking at a div. GSAP handles the entrance choreography while Framer Motion picks up interactive states. It's a relay race of animation libraries.",
    category: "feature",
  },
  {
    name: "Case Studies",
    year: 2024,
    degree: 0,
    variant: "large",
    title: "Slide-based case study architecture",
    narrative:
      "Case studies became full-screen presentations with keyboard and scroll navigation. Each slide is its own universe \u2014 complete with minimap dots and transitions smoother than a conference keynote.",
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
      "The first case study to battle-test the slide architecture. Luma's design system got the full treatment \u2014 rich visuals, interactive components, and that satisfying feeling of dogfooding your own framework.",
    category: "content",
  },
  {
    name: "Prudential",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "Enterprise design case study",
    narrative:
      "Prudential: where 'move fast and break things' meets 'please submit a change request form.' This case study proves you can navigate enterprise bureaucracy and still ship beautiful work.",
    category: "content",
  },
  {
    name: "Multi-Page",
    year: 2024,
    degree: 0,
    variant: "large",
    title: "Migration from SPA to MPA with Vite",
    narrative:
      "The great migration. Single-page app became multi-page overnight. Each case study got its own HTML entry point \u2014 better load times, better SEO, and the router finally stopped having an identity crisis.",
    category: "architecture",
    architectureNote:
      "Moved from SPA with React Router to Vite MPA with rollupOptions.input entries per page.",
    complexityDelta: -12,
  },
  {
    name: "Theme Toggle",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "Dark/light mode toggle with magnetic snap sound",
    narrative:
      "A toggle so satisfying you'll switch themes just to hear it click. Magnetic snap sound effect via Web Audio API, smooth transitions, localStorage persistence. It's a toggle. It shouldn't be this good.",
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
      "Zero audio files. Every click, swoosh, and pop is synthesized at runtime using oscillators and filtered noise. The browser IS the instrument. Some call it unnecessary. Others call it craft.",
    category: "interaction",
    architectureNote:
      "Pure Web Audio API implementation. Zero audio file dependencies.",
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
    name: "SponsorBase",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Sponsorship platform case study",
    narrative:
      "SponsorBase got the slide treatment \u2014 a deep dive into building a sponsorship matching platform. Complex data flows, beautiful dashboards, and the eternal question: 'can we make this more visual?'",
    category: "content",
  },
  {
    name: "Smooth Scroll",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Lenis smooth scrolling on mobile",
    narrative:
      "Lenis entered the chat and suddenly mobile scrolling felt like butter on a hot pan. Native-feel performance across all platforms. Your thumb will thank you.",
    category: "performance",
  },
  {
    name: "SEO + Sitemap",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Comprehensive sitemap and meta tags",
    narrative:
      "The unglamorous but essential work. Sitemap generation, meta tags, OpenGraph images \u2014 everything Google needs to actually know this site exists. Turns out 'build it and they will come' requires an XML file.",
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
      "The crown jewel. An AI-powered tool that helps designers find their creative direction. The portfolio stopped being a static showcase and became an interactive product demo. Meta? Absolutely.",
    category: "feature",
  },
];

// ─── SponsorBase ─────────────────────────────────────────────────────
const SPONSORBASE_RAW: TimelineData = [
  {
    name: "Project Init",
    year: 2024,
    degree: 0,
    variant: "large",
    title: "SponsorBase monorepo scaffolded with Next.js + Supabase",
    narrative:
      "A sponsorship platform born from the simple question: 'Why is finding sponsors still done over email chains?' Next.js for the frontend, Supabase for the backend, and blind optimism for everything else.",
    category: "foundation",
    commits: [
      {
        hash: "sb01a1b",
        author: "Edward Guillen",
        date: "2024-01-10",
        message: "Initial monorepo scaffold with Next.js App Router + Supabase",
        insertions: 1842,
        deletions: 0,
      },
    ],
  },
  {
    name: "Auth Flow",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "Supabase Auth with magic links and OAuth",
    narrative:
      "Magic links, Google OAuth, and a password-free experience because nobody remembers their password anyway. The auth flow was polished until logging in felt like walking through an automatic door.",
    category: "feature",
    commits: [
      {
        hash: "sb02c3d",
        author: "Edward Guillen",
        date: "2024-02-05",
        message: "Implement Supabase auth with magic links and Google OAuth",
        insertions: 634,
        deletions: 12,
      },
    ],
  },
  {
    name: "Sponsor Profiles",
    year: 2024,
    degree: 0,
    variant: "large",
    title: "Sponsor profile builder with media uploads",
    narrative:
      "Sponsors got their own profile builder \u2014 logo uploads, budget ranges, target audience tags, and a bio field that nobody writes more than two sentences in. The UI makes it look like they wrote a novel.",
    category: "feature",
  },
  {
    name: "Event Dashboard",
    year: 2024,
    degree: 0,
    variant: "large",
    title: "Event organizer dashboard with real-time metrics",
    narrative:
      "The dashboard where event organizers watch sponsorship proposals roll in like a stock ticker. Real-time updates via Supabase subscriptions, filterable cards, and that dopamine hit of a new match notification.",
    category: "feature",
    commits: [
      {
        hash: "sb04e5f",
        author: "Edward Guillen",
        date: "2024-04-18",
        message: "Build event organizer dashboard with real-time Supabase subscriptions",
        insertions: 2341,
        deletions: 187,
      },
    ],
  },
  {
    name: "Matching Engine",
    year: 2024,
    degree: 0,
    variant: "large",
    title: "AI-powered sponsor-event matching algorithm",
    narrative:
      "The secret sauce. An algorithm that matches sponsors to events based on audience overlap, budget fit, and industry alignment. It's like a dating app, but for brands and conferences. Swipe right on ROI.",
    category: "architecture",
    architectureNote: "Edge function runs matching algorithm on Supabase cron, scores stored in materialized view.",
  },
  {
    name: "Proposal Flow",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "Sponsorship proposal and negotiation system",
    narrative:
      "A structured proposal flow that replaced the chaos of back-and-forth emails. Templates, tier selection, counter-offers \u2014 all tracked in one place. Negotiation became a UI problem, not a patience problem.",
    category: "feature",
    commits: [
      {
        hash: "sb06g7h",
        author: "Edward Guillen",
        date: "2024-06-22",
        message: "Implement proposal creation and negotiation workflow",
        insertions: 1567,
        deletions: 234,
      },
    ],
  },
  {
    name: "Payment Integration",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "Stripe Connect for sponsor payments",
    narrative:
      "Stripe Connect entered the building and suddenly money could actually change hands. Split payments, automatic invoicing, and the peace of mind that comes from not building your own payment system.",
    category: "infrastructure",
  },
  {
    name: "Analytics",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "Sponsorship ROI analytics dashboard",
    narrative:
      "Charts, graphs, and the numbers sponsors actually care about: impressions, engagement, cost-per-interaction. Built with Recharts because sponsors love a good bar graph more than they love a good keynote.",
    category: "feature",
    commits: [
      {
        hash: "sb08i9j",
        author: "Edward Guillen",
        date: "2024-08-15",
        message: "Add ROI analytics dashboard with Recharts visualizations",
        insertions: 892,
        deletions: 45,
      },
    ],
  },
  {
    name: "Email System",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Transactional emails with React Email + Resend",
    narrative:
      "Beautiful transactional emails that people actually read. React Email for templating, Resend for delivery, and the restraint to not add 'Sent from SponsorBase' to every footer.",
    category: "infrastructure",
  },
  {
    name: "Mobile Responsive",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Full mobile responsive overhaul",
    narrative:
      "The dashboard that was 'mostly mobile-friendly' became 'actually mobile-friendly.' Every table became a card, every sidebar became a drawer, and every sponsor could finally close deals from their phone.",
    category: "design",
    commits: [
      {
        hash: "sb10k1l",
        author: "Edward Guillen",
        date: "2025-01-20",
        message: "Complete mobile responsive overhaul for all dashboard views",
        insertions: 1234,
        deletions: 678,
      },
    ],
  },
  {
    name: "Public API",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "Public REST API for third-party integrations",
    narrative:
      "SponsorBase opened its doors to the world with a public API. Event platforms, CRM tools, and that one guy who built a Slack bot for sponsorship alerts. Rate-limited, documented, and actually tested.",
    category: "architecture",
    architectureNote: "OpenAPI 3.1 spec auto-generated from Zod schemas. Rate limiting via Upstash Redis.",
  },
];

// ─── Luma ────────────────────────────────────────────────────────────
const LUMA_RAW: TimelineData = [
  {
    name: "Luma Genesis",
    year: 2023,
    degree: 0,
    variant: "large",
    title: "Luma design system initialized from Figma tokens",
    narrative:
      "It started with a Figma file and a dream. 200+ design tokens exported, a component library bootstrapped, and the bold declaration: 'We will never argue about button padding again.'",
    category: "foundation",
    commits: [
      {
        hash: "lm01a1b",
        author: "Edward Guillen",
        date: "2023-03-15",
        message: "Initialize Luma design system with Figma token export",
        insertions: 2341,
        deletions: 0,
      },
    ],
  },
  {
    name: "Token Pipeline",
    year: 2023,
    degree: 0,
    variant: "medium",
    title: "Automated Figma-to-code token pipeline",
    narrative:
      "A pipeline that syncs Figma tokens to CSS variables automatically. Change a color in Figma, push to main, see it in production. The designer-developer handoff problem, solved with a GitHub Action.",
    category: "infrastructure",
    commits: [
      {
        hash: "lm02c3d",
        author: "Edward Guillen",
        date: "2023-04-10",
        message: "Build Figma-to-CSS token sync pipeline via GitHub Actions",
        insertions: 567,
        deletions: 23,
      },
    ],
  },
  {
    name: "Core Components",
    year: 2023,
    degree: 0,
    variant: "large",
    title: "Button, Input, Card \u2014 the holy trinity",
    narrative:
      "Every design system starts with three components and the delusion that 'this will be quick.' Button took a week. Input took two. Card took three and a therapy session about border-radius.",
    category: "feature",
  },
  {
    name: "Theme Engine",
    year: 2023,
    degree: 0,
    variant: "large",
    title: "Multi-theme engine with dark mode and brand variants",
    narrative:
      "One design system, infinite themes. Dark mode, light mode, and custom brand palettes all driven by CSS custom properties. Switching themes became a one-liner. The CSS-in-JS crowd wept.",
    category: "architecture",
    architectureNote: "Theme switching via data-theme attribute on <html>. Zero JS runtime for theme application.",
    commits: [
      {
        hash: "lm04e5f",
        author: "Edward Guillen",
        date: "2023-07-20",
        message: "Implement multi-theme engine with CSS custom property layers",
        insertions: 1892,
        deletions: 432,
      },
    ],
  },
  {
    name: "Docs Site",
    year: 2023,
    degree: 0,
    variant: "medium",
    title: "Interactive documentation with live code playgrounds",
    narrative:
      "Documentation nobody will read unless it has live examples. So every component got a playground, every token got a swatch, and every page got a 'Copy to clipboard' button that actually works.",
    category: "content",
  },
  {
    name: "Form System",
    year: 2024,
    degree: 0,
    variant: "large",
    title: "Composable form system with validation",
    narrative:
      "Forms: the final boss of UI development. A composable form system with Zod validation, accessible error messages, and the radical idea that form fields should actually look consistent across the app.",
    category: "feature",
    commits: [
      {
        hash: "lm06g7h",
        author: "Edward Guillen",
        date: "2024-01-15",
        message: "Build composable form system with Zod schema validation",
        insertions: 2134,
        deletions: 345,
      },
    ],
  },
  {
    name: "Data Tables",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "Sortable, filterable data table component",
    narrative:
      "A data table component that handles sorting, filtering, pagination, and column resizing without making you want to rewrite it from scratch. Built on TanStack Table because reinventing the wheel is for tires, not tables.",
    category: "feature",
  },
  {
    name: "Animation Kit",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "Motion primitives and transition presets",
    narrative:
      "A curated set of animation primitives \u2014 fade, slide, scale, stagger \u2014 all with consistent easing and duration tokens. Every transition in the system now speaks the same visual language.",
    category: "interaction",
    commits: [
      {
        hash: "lm08i9j",
        author: "Edward Guillen",
        date: "2024-05-10",
        message: "Add motion primitives with spring and easing presets",
        insertions: 678,
        deletions: 89,
      },
    ],
  },
  {
    name: "A11y Audit",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "Full WCAG 2.1 AA accessibility audit and fixes",
    narrative:
      "Every component tested with screen readers, keyboard navigation, and color contrast checkers. 47 issues found. 47 issues fixed. The design system went from 'probably accessible' to 'actually accessible.'",
    category: "infrastructure",
  },
  {
    name: "Icon System",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "Tree-shakeable icon library with 200+ icons",
    narrative:
      "200 icons, zero unused bytes. A tree-shakeable icon system where you import only what you use. The bundle size police approved. Every icon pixel-aligned to a 24x24 grid because chaos is for art, not UIs.",
    category: "design",
    commits: [
      {
        hash: "lm10k1l",
        author: "Edward Guillen",
        date: "2024-08-01",
        message: "Launch tree-shakeable icon library with 200+ aligned icons",
        insertions: 4521,
        deletions: 123,
      },
    ],
  },
  {
    name: "v2 Launch",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "Luma v2: complete rewrite with React Server Components",
    narrative:
      "Luma v2 \u2014 the one where everything was rewritten because v1 taught you what not to do. React Server Components, streaming SSR, and a 60% reduction in client-side JavaScript. The glow-up was real.",
    category: "architecture",
    architectureNote: "Full RSC migration. Client components reduced from 89 to 34. Bundle size down 60%.",
    commits: [
      {
        hash: "lm11m2n",
        author: "Edward Guillen",
        date: "2025-01-15",
        message: "Luma v2 stable release: RSC migration complete",
        insertions: 12847,
        deletions: 8923,
      },
    ],
  },
];

// ─── Registry ────────────────────────────────────────────────────────

export const DEMO_REPOS: DemoRepo[] = [
  {
    slug: "edwardguillen-portfolio",
    label: "Edward\u2019s Portfolio",
    repoName: "helloluma/edwardguillen",
    description: "Personal design portfolio \u2014 Vite + React",
    timeline: transformData([...PORTFOLIO_RAW]),
  },
  {
    slug: "sponsorbase",
    label: "SponsorBase",
    repoName: "SponsorBase/Web-App",
    description: "Sponsorship matching platform \u2014 Next.js + Supabase",
    timeline: transformData([...SPONSORBASE_RAW]),
  },
  {
    slug: "luma-design-system",
    label: "Luma",
    repoName: "Luma-Comply/Web-App",
    description: "Enterprise design system \u2014 React + Tokens",
    timeline: transformData([...LUMA_RAW]),
  },
];

export function getDemoRepo(slug: string): DemoRepo | undefined {
  return DEMO_REPOS.find((r) => r.slug === slug);
}
