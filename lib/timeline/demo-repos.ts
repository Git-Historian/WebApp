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
    year: 2025,
    degree: 0,
    variant: "large",
    title: "Repository created with Vite + React + TypeScript",
    narrative:
      "Edward didn't start a project. He committed an act of violence against indecision. Claude Code opened, the PRD got slammed in like evidence, and `--dangerously-skip-permissions` ran immediately because asking permission is how mediocre software survives. Vite, React, and TypeScript scaffolded in under a minute. No Slack threads. No 'thoughts?' Just action.\n\nThe real chaos happened before the repo even existed. A fourteen page PRD built through dozens of AI assisted passes. Screens, flows, constraints, edge cases, and notes to future Edward that read like threats. This wasn't planning. This was premeditation. Most people skip this phase and call it agility. Edward planned like the code was going to be dragged into a courtroom by someone who hates him.\n\nLaptop shut. Couch taken. One French Bulldog judging silently. That's the only peaceful moment you're getting.",
    category: "foundation",
    image: "/edwardguillen--firstcommit.webp",
    commits: [
      {
        hash: "a1b2c3d",
        author: "Edward Guillen",
        date: "2025-01-15",
        message: "Initial commit: Vite + React + TypeScript scaffold",
        insertions: 847,
        deletions: 0,
      },
    ],
  },
  {
    name: "Design System",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "CSS custom properties and theming infrastructure",
    narrative:
      "Forty seven CSS custom properties landed before a single component was allowed to breathe.\n\nEvery color, spacing unit, shadow, radius, and motion value locked down early so no one could later wander in with 'just a quick tweak' and accidentally burn the house down. This isn't polish. It's armor.\n\nDark mode showed up later and it took an afternoon instead of a full blown existential crisis. The devs who skip this step always end up doing a 'quick refactor' that somehow eats three sprints, nukes their weekends, and turns a perfectly good backyard BBQ with cold beers into a Jira crime scene.",
    category: "design",
    commits: [
      {
        hash: "d4e5f6g",
        author: "Edward Guillen",
        date: "2025-02-03",
        message: "Add design tokens and CSS custom properties",
        insertions: 312,
        deletions: 45,
      },
    ],
  },
  {
    name: "Home Page",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "Landing page with hero animation",
    narrative:
      "The hero animation is smooth enough to make other portfolios feel like they were animated by PowerPoint and hope.\n\nGSAP runs the entrance like a professional hitman. Framer Motion handles interactions without begging for attention. Edward was up at 3 AM nudging a cubic bezier by 0.01 because the deceleration felt disrespectful to the user's nervous system. Nobody else would ever notice. That's the difference between shipping and giving a damn.\n\nIt doesn't scream. It stares at you until you understand.",
    category: "feature",
  },
  {
    name: "Case Studies",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "Slide-based case study architecture",
    narrative:
      "PDF case studies are an insult. Edward refused to participate in that farce.\n\nEach case study is a full screen slide experience with keyboard navigation, scroll driven transitions, and minimap indicators that keep you oriented without holding your hand. These aren't pages pretending to matter. They're products with state, timing, and intent baked into every movement.\n\nClaude Code helped wire the scroll logic. Edward argued with it about transition timing like two people who both refuse to be wrong and absolutely should not be allowed near each other. They landed on 320ms. It's perfect. Shut up.",
    category: "architecture",
    commits: [
      {
        hash: "h7i8j9k",
        author: "Edward Guillen",
        date: "2025-03-20",
        message: "Implement slide-based case study framework",
        insertions: 1247,
        deletions: 89,
      },
      {
        hash: "l0m1n2o",
        author: "Edward Guillen",
        date: "2025-03-22",
        message: "Add keyboard navigation and minimap",
        insertions: 456,
        deletions: 23,
      },
    ],
  },
  {
    name: "Luma Study",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "First case study: Luma design system",
    narrative:
      "Nothing exposes bullshit faster than using your own system in public.\n\nEdward dogfooded the slide framework on the Luma case study and immediately found problems. A Safari only z index bug. A scroll listener leaking memory. A CSS variable typo quietly ruining everything behind the scenes. All fixed. All pushed straight to main. No announcement. No blog post.\n\nIf your own framework can't survive contact with reality, it deserves to be embarrassed.",
    category: "content",
  },
  {
    name: "Prudential",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Enterprise design case study",
    narrative:
      "Enterprise work without honesty reads like corporate fan fiction. Edward didn't play that game.\n\nReal screenshots. Real constraints. Real compromises explained without buzzwords or cologne. No 'driving alignment.' No 'leveraging synergies.' Just what shipped, why it shipped, and what he'd change if compliance stopped breathing down everyone's necks.\n\nThe design team loved it. Legal asked for revisions. That reaction alone confirmed it was done right.",
    category: "content",
  },
  {
    name: "Multi-Page",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "Migration from SPA to MPA with Vite",
    narrative:
      "Edward woke up on a Saturday, checked Lighthouse, and realized the SPA was lying to him.\n\nA single page app for a portfolio was comically overkill. So he tore it apart before lunch. Each case study got its own HTML entry. Load times dropped immediately. SEO stopped pretending and started working. Google could finally crawl the site instead of staring at a blank div waiting for JavaScript to wake up.\n\nReact Router was deleted entirely. It felt like dumping someone you should've left months ago but kept around out of habit.",
    category: "architecture",
    architectureNote:
      "Moved from SPA with React Router to Vite MPA with rollupOptions.input entries per page.",
    complexityDelta: -12,
  },
  {
    name: "Theme Toggle",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Dark/light mode toggle with magnetic snap sound",
    narrative:
      "Edward spent three full days on a toggle switch. One toggle.\n\nIt synthesizes a magnetic snap sound using raw Web Audio API nodes. Every color token cross fades cleanly. Preferences persist. The interaction feels physical even though it's pure math and spite.\n\nIt should not feel this good. It absolutely does. He's not sorry and he never will be.",
    category: "interaction",
    commits: [
      {
        hash: "p3q4r5s",
        author: "Edward Guillen",
        date: "2025-07-10",
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
      "There are zero audio files in this repository. None.\n\nEvery click, pop, slide, and snap is generated live using oscillators, gain nodes, and filtered noise. The browser is the instrument. Seven sound profiles. Zero dependencies. Zero downloads.\n\nMost users don't consciously notice the sounds. They just feel like the interface has weight. Loud is easy. Subtle takes obsession.",
    category: "interaction",
    architectureNote:
      "Pure Web Audio API implementation. Zero audio file dependencies.",
    commits: [
      {
        hash: "t6u7v8w",
        author: "Edward Guillen",
        date: "2025-09-05",
        message: "Add subtle UI sounds via Web Audio API",
        insertions: 234,
        deletions: 0,
      },
      {
        hash: "x9y0z1a",
        author: "Edward Guillen",
        date: "2025-09-06",
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
      "Same slide framework. Bigger problem.\n\nExplaining a B2B product to people who don't give a shit what Supabase is means focusing on moments, not plumbing. Watching a match appear in real time. Seeing a deal close. Feeling momentum instead of reading documentation.\n\nNobody cares about WebSockets. Everybody cares about watching money move.",
    category: "content",
  },
  {
    name: "Smooth Scroll",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Lenis smooth scrolling on mobile",
    narrative:
      "Default mobile scrolling is acceptable until it isn't. This wasn't.\n\nLenis smoothed everything out. Full screen transitions stopped fighting your thumb. Edward tested it on multiple phones, tablets, and one ancient Android that refuses to die. Smooth everywhere.\n\nIf scrolling this site feels good, it's because someone obsessed over it instead of calling it 'good enough.'",
    category: "performance",
  },
  {
    name: "SEO + Sitemap",
    year: 2026,
    degree: 0,
    variant: "medium",
    title: "Comprehensive sitemap and meta tags",
    narrative:
      "No one brags about sitemap.xml. That's why most portfolios are invisible.\n\nEdward handled it anyway. Canonical URLs. Proper metadata. OpenGraph images that actually render when dropped into Slack. Descriptions written by a human instead of a template hallucination.\n\nTurns out 'build it and they will come' is complete bullshit unless Google can actually see you.",
    category: "infrastructure",
    commits: [
      {
        hash: "b2c3d4e",
        author: "Edward Guillen",
        date: "2026-01-01",
        message: "Update sitemap with all pages, articles, and trailing slashes",
        insertions: 45,
        deletions: 12,
      },
    ],
  },
  {
    name: "Portfolio Compass",
    year: 2026,
    degree: 0,
    variant: "large",
    title: "AI-powered design direction tool",
    narrative:
      "This is the whole point.\n\nAn AI powered tool baked directly into the portfolio that answers questions using real project context. Not a gimmick. Not a toy. A live product proving Edward doesn't just talk about AI driven interfaces. He builds them and ships them.\n\nThe portfolio doesn't explain the work. It is the work.",
    category: "feature",
  },
];

// ─── SponsorBase ─────────────────────────────────────────────────────
const SPONSORBASE_RAW: TimelineData = [
  {
    name: "Project Init",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "SponsorBase scaffolded with Next.js 15 + Supabase + Tailwind v4",
    narrative:
      "Edward was on Reddit watching micro influencers under 100k followers beg for sponsorship money through email chains that look like ransom negotiations. Screenshots of inboxes. Endless threads. People arguing over rates like they were negotiating bail instead of brand deals. Everyone exhausted. Nobody in control.\n\nResearch was conducted. And boy was it conducted.\n\nHours lost reading the same complaints on repeat. Creators chasing brands. Brands ghosting creators. Deals dying because someone forgot to reply or decided to \"circle back\" next week. If you are still managing sponsorship deals through Gmail and a spreadsheet in 2025, you are not scrappy. You are drowning.\n\nSponsorBase came from that moment. Not as a startup idea. As a correction. A deal pipeline for micro influencers who are tired of losing money to disorganization.",
    category: "foundation",
    image: "/sponsorbase-firstcommit.webp",
    commits: [
      {
        hash: "sb01a1b",
        author: "Edward Guillen",
        date: "2025-01-10",
        message: "Initial scaffold: Next.js 15 App Router + Supabase + Tailwind v4",
        insertions: 1842,
        deletions: 0,
      },
    ],
  },
  {
    name: "Auth + RBAC",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Supabase Auth with role-based access control",
    narrative:
      "Edward refused to ship a version one that starts with password misery. Supabase Auth handles magic links and OAuth so nobody has to pretend they remember a password from three months ago. The authentication experience is supposed to disappear. If users notice it, it failed.\n\nBut auth alone is not enough when teams are involved. Role-based access control ships from day one: owner, admin, member, read-only. Every mutating action checks your role before touching the database. Row Level Security on every table. If the API has a bug, RLS still holds. Security by architecture, not by hope.",
    category: "infrastructure",
    commits: [
      {
        hash: "sb02c3d",
        author: "Edward Guillen",
        date: "2025-02-05",
        message: "Implement Supabase auth, RBAC roles, RLS policies on all tables",
        insertions: 934,
        deletions: 12,
      },
    ],
  },
  {
    name: "Deal Kanban",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "Drag-and-drop deal pipeline with four-stage Kanban board",
    narrative:
      "This is the war room. Creators live here. Four columns: Prospect, Contacted, Negotiating, Closed. Drag a card from one column to the next and the database updates before your finger lifts. Optimistic UI. No spinners. No \"saving...\" toast. Just motion that feels like the software respects your time.\n\nEach deal card shows brand name, contact, value, and payment status at a glance. Click to edit. Click to archive. Table view toggle for the spreadsheet people who refuse to let go. The board becomes the page people leave open all day because a deal might move and they want to see it first.\n\nBuilt on dnd-kit because HTML5 drag and drop is a horror movie Edward refused to star in.",
    category: "feature",
    commits: [
      {
        hash: "sb03d4e",
        author: "Edward Guillen",
        date: "2025-03-18",
        message: "Build Kanban board with dnd-kit, optimistic updates, table view toggle",
        insertions: 2341,
        deletions: 187,
      },
    ],
  },
  {
    name: "Rate Calculator",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "AI market rate calculator with Perplexity research + Gemini parsing",
    narrative:
      "Every creator has asked the same question: \"What should I charge?\" Before SponsorBase, the answer was guesswork. Reddit threads. Friends who lie. Brands who lowball.\n\nThe rate calculator kills that uncertainty. Pick your platform (YouTube, Instagram, TikTok, Twitch, or anything else), enter your niche, follower count, and average engagement. Perplexity Sonar queries real-time market data for current sponsorship benchmarks. Gemini parses the research into structured JSON: low, mid, and high rate tiers with market context explaining why.\n\nResults cache in Upstash Redis for 24 hours so repeated lookups are instant. History saves to Supabase so creators can track how their rates should grow over time. If your account is under the monetization threshold, the calculator tells you that too. Honestly. No fake encouragement.",
    category: "architecture",
    architectureNote: "Perplexity Sonar for market research, Gemini 2.0 Flash for JSON parsing. Upstash Redis cache with 24hr TTL.",
    commits: [
      {
        hash: "sb04e5f",
        author: "Edward Guillen",
        date: "2025-04-25",
        message: "Build rate calculator: Perplexity research + Gemini parse + Redis cache",
        insertions: 1890,
        deletions: 45,
      },
    ],
  },
  {
    name: "Pitch Generator",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "AI pitch generator producing cold, follow-up, and counter-offer emails",
    narrative:
      "Most creators stare at a blank email for twenty minutes, write something that sounds like a cover letter from 2009, and wonder why brands never reply. SponsorBase fixes that by generating three pitch variations in one shot.\n\nCold pitch for first contact. Follow-up for the brand that opened your email and said nothing for two weeks. Counter-offer for when they come back with a number that insults your audience. Each one is generated by Gemini with your brand context, niche, and audience fit baked into the prompt.\n\nThe output is copy you can actually send. Not placeholder garbage. Not \"Dear [Brand Name]\" templates. Real pitches with real hooks that sound like a person wrote them on their best day. Copy to clipboard. Send. Move on.",
    category: "feature",
    commits: [
      {
        hash: "sb05f6g",
        author: "Edward Guillen",
        date: "2025-06-10",
        message: "Implement AI pitch generator: cold/follow-up/counter with Gemini",
        insertions: 1567,
        deletions: 78,
      },
    ],
  },
  {
    name: "Email Templates",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Six AI email templates for every stage of the deal lifecycle",
    narrative:
      "Pitches are just the beginning. Creators need emails for every awkward moment in a sponsorship deal. Thank you notes after closing. Payment reminders when the brand conveniently forgets. Deliverables-complete notifications so everyone knows the work is done.\n\nSix template types. Cold pitch, follow-up, counter-offer, thank you, payment reminder, deliverables complete. Each one has a custom form. Each one generates a subject line and body through Gemini. Each one saves to history so you never start from scratch twice. The template page is where deals stop dying to bad communication.",
    category: "feature",
    commits: [
      {
        hash: "sb06g7h",
        author: "Edward Guillen",
        date: "2025-07-15",
        message: "Build email template system: 6 types with AI generation and history",
        insertions: 1340,
        deletions: 134,
      },
    ],
  },
  {
    name: "Contract Assistant",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "AI contract reviewer with PDF upload and scam detection",
    narrative:
      "Creators sign contracts they do not understand. That is not an insult. It is a fact. Perpetuity clauses buried on page seven. Exclusivity windows that block competing deals for six months. Usage rights that let a brand run your face on billboards forever. Most people find out after the money stops.\n\nThe contract assistant is a chat interface powered by GPT-4o-mini. Upload a PDF or paste contract text. Ask it anything. It identifies red flags: upfront payment requests, unrealistic promises, pressure tactics, off-platform communication demands. It reviews clauses: payment terms, deliverables, exclusivity, termination conditions, liability. It defines jargon: net 30, whitelisting, usage rights, indemnification.\n\nConversation history saves. Glossary definitions cache to avoid re-querying the same terms. This is the feature that stops creators from signing deals that cost more than they pay.",
    category: "architecture",
    architectureNote: "GPT-4o-mini for contract analysis. PDF.js for text extraction. Conversation persistence in Supabase.",
    commits: [
      {
        hash: "sb07h8i",
        author: "Edward Guillen",
        date: "2025-08-22",
        message: "Ship contract assistant: chat UI, PDF upload, scam detection, glossary cache",
        insertions: 2100,
        deletions: 210,
      },
    ],
  },
  {
    name: "Payment Tracking",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Payment status tracking with AI-generated reminder emails",
    narrative:
      "Closing a deal is not the finish line. Getting paid is. SponsorBase tracks payment status on every closed deal: paid, pending, or overdue. Due dates visible on each card. When a brand is late, the creator does not have to write an awkward \"just checking in\" email from scratch.\n\nOne click generates a professional payment reminder through Gemini. Amount, brand name, due date, contact. Clear, firm, not hostile. Copy the subject and body separately. Send it. The platform timestamps when the reminder was sent so there is a paper trail if things get ugly. Because sometimes they do.",
    category: "feature",
    commits: [
      {
        hash: "sb08i9j",
        author: "Edward Guillen",
        date: "2025-09-30",
        message: "Add payment tracking with AI reminder generation and send timestamps",
        insertions: 892,
        deletions: 45,
      },
    ],
  },
  {
    name: "Stripe + Quotas",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Stripe subscription billing with AI usage quota system",
    narrative:
      "Billing built on Stripe with webhook-driven subscription management. Monthly and yearly tiers. Trial period with cron-based expiration warnings. Failed payment handling that does not leave users in limbo.\n\nEvery AI feature runs through a quota system. Rate calculations, pitch generation, email templates, contract assistant messages, payment reminders. Each request increments the counter. The counter resets monthly. If you hit your limit, the UI tells you clearly instead of failing silently. Every AI call logs the model, token count, and cost to an audit table. Edward tracks spend per user because giving away unlimited AI calls is how startups go broke pretending to be generous.",
    category: "infrastructure",
    architectureNote: "Stripe webhooks for subscription lifecycle. Upstash Redis for quota tracking. ai_generations table for cost audit.",
    commits: [
      {
        hash: "sb09j0k",
        author: "Edward Guillen",
        date: "2025-11-05",
        message: "Integrate Stripe billing, AI quota system, usage audit logging",
        insertions: 1450,
        deletions: 120,
      },
    ],
  },
  {
    name: "Landing + PWA",
    year: 2026,
    degree: 0,
    variant: "medium",
    title: "Marketing landing page with parallax and PWA support",
    narrative:
      "The public face. A parallax landing page with a live demo Kanban board, features carousel, and testimonials. The landing page sells the pain before it sells the product. Creators scrolling through see their own chaos reflected back at them. Then they see the fix.\n\nPWA support ships alongside so creators can install SponsorBase on their phone and manage deals without opening a browser. Tables become card stacks. Sidebars become drawers. Filters collapse into something your thumb can reach without gymnastics. People can close deals from their phone while pretending to pay attention in a meeting. That is not a bug. That is the reality.",
    category: "design",
    commits: [
      {
        hash: "sb10k1l",
        author: "Edward Guillen",
        date: "2026-01-10",
        message: "Ship landing page with parallax, demo Kanban, and PWA manifest",
        insertions: 1870,
        deletions: 340,
      },
    ],
  },
  {
    name: "Production Deploy",
    year: 2026,
    degree: 0,
    variant: "large",
    title: "Sentry monitoring, Clarity analytics, and Vercel production deploy",
    narrative:
      "Then Edward opened the doors. Sentry for error tracking so nothing breaks silently. Microsoft Clarity for session recording so real user behavior replaces guesswork. Vitest with fast-check property-based testing because regular unit tests catch the bugs you expect and property tests catch the ones you do not.\n\nCron jobs handle the background work: payment reminder queues, trial expiration notifications, failed payment recovery. Security headers lock down every response. Cache-Control on protected pages prevents the back-button-after-logout problem. Zod validation on every input. Rate limiting via Upstash Redis so nobody gets out of hand.\n\nSponsorBase shipped to Vercel. A complete sponsorship management platform for micro influencers across every platform. From lead to pitch to contract to payment. Every step has AI assistance. Every deal has a home. No more spreadsheets. No more inbox archaeology. Just a pipeline that works.",
    category: "infrastructure",
    architectureNote: "Sentry + Clarity monitoring. Vitest + fast-check testing. Cron jobs for payment reminders and trial warnings. Vercel deploy.",
    commits: [
      {
        hash: "sb11l2m",
        author: "Edward Guillen",
        date: "2026-02-01",
        message: "Production deploy: Sentry, Clarity, cron jobs, security hardening",
        insertions: 1120,
        deletions: 290,
      },
    ],
  },
];

// ─── Luma (B2B Medical SaaS - serious, precise, grounded tone) ──────
const LUMA_RAW: TimelineData = [
  {
    name: "PRD Research",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "Product requirements research committed to repo",
    narrative:
      "Before a single line of code was written, Edward spent weeks studying how biologics prior authorizations actually work. Interviewed dermatologists, rheumatologists, and office staff. Sat through documentation calls. Read CMS LCD/NCD guidelines cover to cover. Mapped out which payers require step therapy documentation, which accept clinical summaries, and which will deny anything that does not cite specific lab thresholds.\n\nAll of this research was committed to the repository. Not as a formality. As a contract with the codebase. Every product decision traces back to a documented finding. Every feature has a reason in writing. When a future contributor asks why the form collects disease activity scores but not dates of birth, the answer lives in the PRD. The research folder contains payer requirement matrices, HIPAA Safe Harbor analysis, competitive audits, and user interview summaries. This is how Edward builds. The evidence goes into version control alongside the code.",
    category: "foundation",
    image: "/luma--firstcommit.webp",
    commits: [
      {
        hash: "lm01a1b",
        author: "Edward Guillen",
        date: "2025-01-15",
        message: "Commit PRD research: payer requirements, HIPAA analysis, user interviews",
        insertions: 4200,
        deletions: 0,
      },
    ],
  },
  {
    name: "Project Init",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "Next.js 15 + Supabase scaffold with HIPAA-first architecture",
    narrative:
      "The first real commit. Next.js 15 App Router, Supabase for auth and database, Tailwind with a custom medical brand palette (sage greens, warm grays, coral for alerts). The architecture was shaped by a single constraint: no protected health information touches the system. HIPAA Safe Harbor compliance means the platform collects only patient name and clinical data. No date of birth, no MRN, no addresses, no insurance IDs. This decision eliminated the need for a Business Associate Agreement with AI providers entirely.\n\nRow Level Security enabled on every table from the first migration. Users see only their own cases. The Supabase schema enforces this at the database level, not the application level. If the API has a bug, RLS still holds. Security by architecture, not by hope.",
    category: "foundation",
    commits: [
      {
        hash: "lm02b2c",
        author: "Edward Guillen",
        date: "2025-02-01",
        message: "Initial scaffold: Next.js 15 + Supabase + Tailwind medical brand tokens",
        insertions: 3100,
        deletions: 0,
      },
    ],
  },
  {
    name: "Auth + RLS",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Supabase Auth with email magic links and Row Level Security",
    narrative:
      "Authentication built on Supabase Auth with email-based magic links. No passwords to forget, no credentials to leak. A database trigger automatically creates a public user record when someone signs up, linking their auth identity to their profile, NPI number, specialty, and practice name. Every table has RLS policies tied to auth.uid(). The middleware layer checks session cookies on every protected route. If the session is invalid, the user hits a wall before the page even renders.",
    category: "infrastructure",
    commits: [
      {
        hash: "lm03c3d",
        author: "Edward Guillen",
        date: "2025-02-20",
        message: "Implement Supabase Auth, magic links, RLS policies on all tables",
        insertions: 890,
        deletions: 34,
      },
    ],
  },
  {
    name: "AI Generation",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "Two-step AI pipeline: Perplexity research + Gemini generation",
    narrative:
      "The core of the product. A two-step AI pipeline that turns clinical inputs into audit-proof medical necessity documentation. Step one: Perplexity Sonar Pro researches current payer-specific requirements for the requested medication and diagnosis codes. LCD/NCD criteria, step therapy rules, documentation thresholds. Step two: Gemini 2.0 Flash takes that research plus the patient's clinical data and generates a formatted medical necessity letter with proper headers, compliance checklists, and diagnosis code citations.\n\nWhat takes a provider 30 to 45 minutes of manual documentation now takes seconds. The output includes everything an auditor looks for: prior treatment history, lab values, disease activity justification, and payer-specific language. The provider reviews, edits if needed, and exports.",
    category: "architecture",
    architectureNote: "Perplexity Sonar Pro for payer research, Gemini 2.0 Flash for document generation. No PHI sent to AI providers.",
    commits: [
      {
        hash: "lm04d4e",
        author: "Edward Guillen",
        date: "2025-04-10",
        message: "Build two-step AI generation: Perplexity research + Gemini doc generation",
        insertions: 1650,
        deletions: 120,
      },
    ],
  },
  {
    name: "Case Dashboard",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "Provider dashboard with case management and status tracking",
    narrative:
      "The operational center of the platform. Providers see all their cases in one place: draft, submitted, approved, denied. Each case shows patient name, medication, payer, status, and time since creation. Search and filtering let practices with high case volume find what they need without scrolling. The dashboard respects subscription status. If a trial has expired or cases are exhausted, the interface communicates that clearly instead of letting the user hit a dead end inside a form.",
    category: "feature",
    commits: [
      {
        hash: "lm05e5f",
        author: "Edward Guillen",
        date: "2025-05-15",
        message: "Build case management dashboard with status tracking and search",
        insertions: 2100,
        deletions: 180,
      },
    ],
  },
  {
    name: "Case Builder",
    year: 2025,
    degree: 0,
    variant: "large",
    title: "Clinical intake form with payer autocomplete and document upload",
    narrative:
      "The case creation form is the most sensitive surface in the application. It collects exactly what the AI pipeline needs and nothing more. Patient first name, last name, age, state, gender. Diagnosis codes via search. Disease activity, lab values, prior treatments as free text. Requested medication and dose. Payer name with autocomplete against a curated database. Document upload supports PDF, DOCX, XLSX, PNG, and JPG for attaching existing clinical records.\n\nA HIPAA acknowledgment checkbox sits above the submit button. The form reminds providers what Luma does not collect: no date of birth, no MRN, no addresses, no phone numbers, no insurance member IDs. This is not a disclaimer. It is a design decision that makes the entire platform possible without a BAA.",
    category: "feature",
    commits: [
      {
        hash: "lm06f6g",
        author: "Edward Guillen",
        date: "2025-06-20",
        message: "Implement clinical intake form with payer autocomplete and file upload",
        insertions: 1800,
        deletions: 95,
      },
    ],
  },
  {
    name: "Export System",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Word, PDF, and clipboard export for generated documentation",
    narrative:
      "Providers need documentation in the format their payer portal or EHR accepts. Luma generates Word files via the docx library and PDFs via jspdf. Copy-to-clipboard handles the cases where providers paste directly into an insurance portal. The generated output preserves headers, compliance checklists, and formatting across all three export paths. No formatting loss between what the provider sees on screen and what arrives at the payer.",
    category: "feature",
  },
  {
    name: "Stripe Billing",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Stripe Connect subscription billing at $399/mo",
    narrative:
      "Billing built on Stripe with webhook-driven subscription management. Professional plan at $399 per month. Three seats included, unlimited cases, all documentation types. Extra seats available as add-ons. The webhook handler processes checkout completions, subscription updates, and cancellations. Subscription status syncs to the Supabase user record so the dashboard reflects billing state in real time without polling Stripe on every page load.",
    category: "infrastructure",
    commits: [
      {
        hash: "lm08h8i",
        author: "Edward Guillen",
        date: "2025-09-05",
        message: "Integrate Stripe billing with webhook subscription management",
        insertions: 1200,
        deletions: 67,
      },
    ],
  },
  {
    name: "Team Management",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Multi-seat team invitations and role management",
    narrative:
      "Medical practices are not single-user operations. The team system lets account owners invite colleagues via email, manage seats, and remove members. Invitation acceptance is handled through a dedicated route with token validation. Each team member operates under the same subscription and case limits. The settings page surfaces billing, profile, and team management in a single location so practice administrators do not need to navigate between disconnected pages.",
    category: "feature",
    commits: [
      {
        hash: "lm09i9j",
        author: "Edward Guillen",
        date: "2025-10-15",
        message: "Add team invitation system with email delivery via Resend",
        insertions: 950,
        deletions: 45,
      },
    ],
  },
  {
    name: "Landing Page",
    year: 2025,
    degree: 0,
    variant: "medium",
    title: "Marketing landing page with compliance messaging and pricing",
    narrative:
      "The public face of the product. Hero section with a clear value proposition: automate documentation, keep patients on life-saving therapies. Problem section quantifying the pain: 12 to 16 hours weekly on paperwork, treatment delays from incomplete documentation, audit clawbacks from insufficient records. Features, testimonials, pricing, compliance section explaining the Safe Harbor approach, and an FAQ. Every section built with scroll-reveal animations and the medical brand system. The landing page converts visitors into trial signups without overpromising or hiding the price.",
    category: "design",
  },
  {
    name: "Sentry + Production",
    year: 2026,
    degree: 0,
    variant: "large",
    title: "Error monitoring, security audit, and Vercel production deploy",
    narrative:
      "Production readiness required Sentry integration for error tracking with source maps, a full security audit of RLS policies and API routes, and environment variable hardening for Vercel deployment. The monitoring tunnel routes through /monitoring to bypass ad blockers. React component annotations improve error attribution in stack traces. Every environment variable was verified against a deployment checklist to prevent the kind of silent misconfiguration that takes down a production service at 2 AM.\n\nLuma shipped to production on Vercel with Supabase as the backend. HIPAA compliant from day one. No PHI in the system. No BAA required. Documentation that used to take 30 minutes now generates in seconds. The platform serves dermatologists, rheumatologists, and specialty practices that depend on biologics prior authorizations to keep patients on therapy.",
    category: "infrastructure",
    architectureNote: "Sentry with tunnel route, Vercel deploy, Supabase RLS verified, env hardening complete.",
    commits: [
      {
        hash: "lm11k1l",
        author: "Edward Guillen",
        date: "2026-01-20",
        message: "Production deploy: Sentry, security audit, Vercel env hardening",
        insertions: 890,
        deletions: 234,
      },
    ],
  },
];

// ─── Registry ────────────────────────────────────────────────────────

export const DEMO_REPOS: DemoRepo[] = [
  {
    slug: "edwardguillen-portfolio",
    label: "Edward Guillen",
    repoName: "Edward Guillen",
    description: "Personal design portfolio",
    timeline: transformData([...PORTFOLIO_RAW]),
  },
  {
    slug: "sponsorbase",
    label: "SponsorBase",
    repoName: "SponsorBase",
    description: "AI sponsorship management for micro influencers",
    timeline: transformData([...SPONSORBASE_RAW]),
  },
  {
    slug: "luma",
    label: "Luma",
    repoName: "Luma",
    description: "AI medical documentation platform",
    timeline: transformData([...LUMA_RAW]),
  },
];

export function getDemoRepo(slug: string): DemoRepo | undefined {
  return DEMO_REPOS.find((r) => r.slug === slug);
}

/** Returns the previous and next demo repos for bottom navigation. Wraps around. */
export function getAdjacentDemos(slug: string): {
  prev: { slug: string; label: string } | null;
  next: { slug: string; label: string } | null;
} {
  const idx = DEMO_REPOS.findIndex((r) => r.slug === slug);
  if (idx === -1) return { prev: null, next: null };

  const prevIdx = (idx - 1 + DEMO_REPOS.length) % DEMO_REPOS.length;
  const nextIdx = (idx + 1) % DEMO_REPOS.length;

  return {
    prev: { slug: DEMO_REPOS[prevIdx].slug, label: DEMO_REPOS[prevIdx].label },
    next: { slug: DEMO_REPOS[nextIdx].slug, label: DEMO_REPOS[nextIdx].label },
  };
}
