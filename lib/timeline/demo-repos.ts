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
      "Case studies became full-screen presentations with keyboard and scroll navigation. Each slide is its own universe — complete with minimap dots and transitions smoother than a conference keynote.",
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
      "The first case study to battle-test the slide architecture. Luma's design system got the full treatment — rich visuals, interactive components, and that satisfying feeling of dogfooding your own framework.",
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
      "The great migration. Single-page app became multi-page overnight. Each case study got its own HTML entry point — better load times, better SEO, and the router finally stopped having an identity crisis.",
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
      "SponsorBase got the slide treatment — a deep dive into building a sponsorship matching platform. Complex data flows, beautiful dashboards, and the eternal question: 'can we make this more visual?'",
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
      "The unglamorous but essential work. Sitemap generation, meta tags, OpenGraph images — everything Google needs to actually know this site exists. Turns out 'build it and they will come' requires an XML file.",
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

// ─── Next.js (fictional timeline) ────────────────────────────────────
const NEXTJS_RAW: TimelineData = [
  {
    name: "Birth of Next",
    year: 2016,
    degree: 0,
    variant: "large",
    title: "Initial release: React framework with SSR built-in",
    narrative:
      "Guillermo Rauch looked at Create React App and thought 'we can do better.' Seven files, zero config, and server-side rendering out of the box. The React ecosystem would never be the same.",
    category: "foundation",
    commits: [
      {
        hash: "f1a2b3c",
        author: "Guillermo Rauch",
        date: "2016-10-25",
        message: "Initial commit",
        insertions: 3241,
        deletions: 0,
      },
    ],
  },
  {
    name: "Dynamic Import",
    year: 2017,
    degree: 0,
    variant: "medium",
    title: "next/dynamic for code splitting",
    narrative:
      "Code splitting arrived with a single function call. Lazy-load any component, show a fallback, ship less JavaScript. Bundle sizes everywhere breathed a collective sigh of relief.",
    category: "feature",
  },
  {
    name: "Custom Server",
    year: 2017,
    degree: 0,
    variant: "medium",
    title: "Custom server API with Express compatibility",
    narrative:
      "For the control freaks who need their own Express middleware. Next.js said 'fine, bring your own server' and somehow made it feel like a feature, not a workaround.",
    category: "architecture",
  },
  {
    name: "Static Export",
    year: 2018,
    degree: 0,
    variant: "large",
    title: "next export for fully static sites",
    narrative:
      "SSR framework goes static. `next export` turned any Next.js app into a folder of HTML files you could host on a napkin. The JAMstack crowd went wild.",
    category: "feature",
    commits: [
      {
        hash: "d4e5f6a",
        author: "Tim Neutkens",
        date: "2018-03-14",
        message: "Add next export command",
        insertions: 892,
        deletions: 34,
      },
    ],
  },
  {
    name: "API Routes",
    year: 2019,
    degree: 0,
    variant: "large",
    title: "Serverless API routes in pages/api",
    narrative:
      "Full-stack in one repo. Drop a file in `pages/api/` and boom — serverless endpoint. Backend developers felt a disturbance in the force. Frontend devs felt liberated.",
    category: "architecture",
    architectureNote: "Each file in pages/api/ becomes a serverless function automatically.",
  },
  {
    name: "getStaticProps",
    year: 2020,
    degree: 0,
    variant: "large",
    title: "Data fetching revolution with getStaticProps/getServerSideProps",
    narrative:
      "The great data fetching rethink. Two functions to rule them all: `getStaticProps` for build-time, `getServerSideProps` for request-time. Suddenly, fetching data in React wasn't a philosophical debate anymore.",
    category: "feature",
    commits: [
      {
        hash: "a7b8c9d",
        author: "Tim Neutkens",
        date: "2020-03-10",
        message: "Implement getStaticProps and getServerSideProps",
        insertions: 2847,
        deletions: 1203,
      },
    ],
  },
  {
    name: "Image Optim",
    year: 2020,
    degree: 0,
    variant: "medium",
    title: "next/image with automatic optimization",
    narrative:
      "Images finally got first-class treatment. Automatic resizing, lazy loading, blur placeholders, and WebP conversion. Your Lighthouse score just went up 20 points without changing a line of code.",
    category: "performance",
  },
  {
    name: "Middleware",
    year: 2021,
    degree: 0,
    variant: "medium",
    title: "Edge middleware for request interception",
    narrative:
      "Code that runs before the page loads, at the edge, in milliseconds. Authentication, redirects, A/B testing — all handled before your React component even knows what hit it.",
    category: "architecture",
  },
  {
    name: "App Router",
    year: 2023,
    degree: 0,
    variant: "large",
    title: "App Router with React Server Components",
    narrative:
      "The biggest architectural shift since Next.js was born. React Server Components, nested layouts, streaming, and a file-system router that makes `pages/` look like a quaint village. Love it or hate it, this is the future.",
    category: "architecture",
    architectureNote: "Complete paradigm shift: pages/ → app/, getServerSideProps → async components.",
    commits: [
      {
        hash: "e1f2g3h",
        author: "Tim Neutkens",
        date: "2023-05-04",
        message: "Stable App Router release",
        insertions: 48291,
        deletions: 12847,
      },
    ],
  },
  {
    name: "Server Actions",
    year: 2023,
    degree: 0,
    variant: "medium",
    title: "Server Actions for form mutations",
    narrative:
      "Write a function, add 'use server', call it from a form. Your mutation runs server-side. No API route, no fetch call, no state management. Is this magic? No, it's just really good DX.",
    category: "feature",
  },
  {
    name: "Turbopack",
    year: 2024,
    degree: 0,
    variant: "large",
    title: "Turbopack replaces Webpack as default bundler",
    narrative:
      "Webpack had a good run. Turbopack enters in Rust, promising 700x faster cold starts (citation needed, but it IS fast). Dev server starts before you finish pressing Enter.",
    category: "performance",
    commits: [
      {
        hash: "i4j5k6l",
        author: "Tobias Koppers",
        date: "2024-10-21",
        message: "Enable Turbopack as default dev bundler",
        insertions: 3421,
        deletions: 8923,
      },
    ],
  },
  {
    name: "PPR",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Partial Prerendering for hybrid static/dynamic",
    narrative:
      "The best of both worlds: static shells with dynamic holes. Your page loads instantly from the CDN, then streams in the personalized bits. It's like having your cake, eating it, and the cake loads in 50ms.",
    category: "feature",
  },
];

// ─── React (fictional timeline) ──────────────────────────────────────
const REACT_RAW: TimelineData = [
  {
    name: "Open Source",
    year: 2013,
    degree: 0,
    variant: "large",
    title: "React open-sourced at JSConf US",
    narrative:
      "Jordan Walke walks on stage and shows the world a library that re-renders everything on every state change. The audience is confused. The audience is intrigued. The audience has no idea they're watching history.",
    category: "foundation",
    commits: [
      {
        hash: "75897d5",
        author: "Jordan Walke",
        date: "2013-05-29",
        message: "Initial public release",
        insertions: 14923,
        deletions: 0,
      },
    ],
  },
  {
    name: "JSX",
    year: 2013,
    degree: 0,
    variant: "medium",
    title: "JSX transform for HTML-in-JavaScript",
    narrative:
      "'You put HTML in your JavaScript?!' — every developer in 2013. 'Yes, and it's beautiful' — every developer by 2015. JSX was controversial for exactly as long as it took people to actually try it.",
    category: "feature",
  },
  {
    name: "Virtual DOM",
    year: 2014,
    degree: 0,
    variant: "large",
    title: "Virtual DOM diffing algorithm",
    narrative:
      "The reconciliation algorithm that launched a thousand Medium articles. Diff the virtual tree, compute minimal DOM updates, batch them. It sounds simple because the hard part is invisible.",
    category: "architecture",
    architectureNote: "O(n) tree diffing via heuristic two-pass algorithm instead of O(n³) general solution.",
  },
  {
    name: "Class Components",
    year: 2015,
    degree: 0,
    variant: "medium",
    title: "ES6 class syntax replaces createClass",
    narrative:
      "React.createClass got a retirement party. ES6 classes moved in. `this.state`, `this.setState`, and the eternal question: 'do I need to bind this method in the constructor?'",
    category: "feature",
  },
  {
    name: "React Native",
    year: 2015,
    degree: 0,
    variant: "large",
    title: "React Native for mobile development",
    narrative:
      "'Learn once, write anywhere.' Not 'write once, run anywhere' — they were careful with that wording. React Native brought component thinking to iOS and Android, and suddenly every web dev was a mobile dev (sort of).",
    category: "architecture",
    commits: [
      {
        hash: "m7n8o9p",
        author: "Christopher Chedeau",
        date: "2015-03-26",
        message: "Open source React Native",
        insertions: 68421,
        deletions: 0,
      },
    ],
  },
  {
    name: "Fiber",
    year: 2017,
    degree: 0,
    variant: "large",
    title: "React Fiber: complete reconciler rewrite",
    narrative:
      "Two years of work. A complete rewrite of React's core reconciliation engine. Fiber made rendering interruptible, pausable, and resumable. Users saw smoother UIs. Developers saw a 12,000-line PR.",
    category: "architecture",
    architectureNote: "Replaced stack-based synchronous reconciler with fiber-based incremental engine.",
    commits: [
      {
        hash: "q1r2s3t",
        author: "Andrew Clark",
        date: "2017-09-26",
        message: "React 16: Fiber reconciler",
        insertions: 23847,
        deletions: 18293,
      },
    ],
  },
  {
    name: "Hooks",
    year: 2019,
    degree: 0,
    variant: "large",
    title: "Hooks: useState, useEffect, and the end of class components",
    narrative:
      "Sophie Alpert and Dan Abramov introduced Hooks and the React world split into before and after. No more `this`, no more lifecycle spaghetti, no more HOC wrapper hell. Just functions all the way down.",
    category: "feature",
    commits: [
      {
        hash: "u4v5w6x",
        author: "Dan Abramov",
        date: "2019-02-06",
        message: "React 16.8: Hooks stable release",
        insertions: 8421,
        deletions: 923,
      },
    ],
  },
  {
    name: "Concurrent",
    year: 2022,
    degree: 0,
    variant: "large",
    title: "Concurrent features and automatic batching",
    narrative:
      "React 18 arrived with concurrent rendering — the promise Fiber made five years earlier, finally delivered. `startTransition`, automatic batching, and the controversial `<StrictMode>` double-render that made everyone's effects run twice.",
    category: "feature",
    commits: [
      {
        hash: "y7z8a9b",
        author: "React Team",
        date: "2022-03-29",
        message: "React 18.0 stable",
        insertions: 12847,
        deletions: 6421,
      },
    ],
  },
  {
    name: "Server Comp",
    year: 2023,
    degree: 0,
    variant: "large",
    title: "React Server Components",
    narrative:
      "Components that run on the server and send HTML, not JavaScript. Zero bundle size for server components. The community had opinions. Many opinions. Several blog posts were written.",
    category: "architecture",
    architectureNote: "Server Components run only on the server, Client Components hydrate on the client.",
  },
  {
    name: "use() Hook",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "The use() hook for promises and context",
    narrative:
      "A hook that reads promises. Just `use(fetchData())` and React suspends until it resolves. No useEffect, no loading state, no race conditions. It's almost suspiciously simple.",
    category: "feature",
  },
  {
    name: "Actions",
    year: 2024,
    degree: 0,
    variant: "medium",
    title: "Form Actions and useActionState",
    narrative:
      "Forms got a React-native API. `useActionState` handles the whole submit → pending → result lifecycle. Combined with Server Actions, it's the most ergonomic form handling React has ever had.",
    category: "feature",
  },
  {
    name: "React Compiler",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "React Compiler auto-memoizes everything",
    narrative:
      "The compiler that makes `useMemo` and `useCallback` obsolete. React analyzes your code at build time and inserts memoization automatically. Years of 'you forgot to memoize' code review comments — gone.",
    category: "performance",
    commits: [
      {
        hash: "c1d2e3f",
        author: "React Team",
        date: "2025-04-14",
        message: "React Compiler stable release",
        insertions: 42891,
        deletions: 3241,
      },
    ],
  },
];

// ─── Registry ────────────────────────────────────────────────────────

export const DEMO_REPOS: DemoRepo[] = [
  {
    slug: "edwardguillen-portfolio",
    label: "Edward's Portfolio",
    repoName: "edwardguillen/portfolio",
    description: "Personal design portfolio \u2014 Vite + React",
    timeline: transformData([...PORTFOLIO_RAW]),
  },
  {
    slug: "vercel-nextjs",
    label: "Next.js",
    repoName: "vercel/next.js",
    description: "The React framework for the web",
    timeline: transformData([...NEXTJS_RAW]),
  },
  {
    slug: "facebook-react",
    label: "React",
    repoName: "facebook/react",
    description: "A library for building user interfaces",
    timeline: transformData([...REACT_RAW]),
  },
];

export function getDemoRepo(slug: string): DemoRepo | undefined {
  return DEMO_REPOS.find((r) => r.slug === slug);
}
