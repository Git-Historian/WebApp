# Git Historian

## Stack
- Next.js 15 (App Router, TypeScript, Tailwind v4)
- motion (Framer Motion) for animations
- @use-gesture/react for gesture handling
- simple-git for repo parsing
- @anthropic-ai/sdk for AI analysis
- shadcn/ui for base components

## Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture
- `app/` — Next.js App Router pages and API routes
- `components/` — React components (timeline/, shared/, analysis/, ui/)
- `lib/` — Core logic (git/, ai/, timeline/, utils/)
- `hooks/` — Custom React hooks
- `public/fonts/` — DD and JetBrains Mono fonts

## Key Design Decisions
- Dark mode default (class="dark" on html)
- Design system from devouringdetails.com (system.css merged into globals.css)
- Radial timeline is the centerpiece — preserve all gesture physics exactly
- Web Audio API sounds (no audio files) — 7 distinct sound types
- SSE for streaming AI analysis progress

## Rules
- Do NOT modify radial timeline spring physics or gesture handling
- Do NOT import from prd-assets/ — those are reference only
- All sounds via lib/sounds.ts — Web Audio API, no files
- WCAG compliance required on all interactive elements
