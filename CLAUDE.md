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
- `app/`:Next.js App Router pages and API routes
- `components/`:React components (timeline/, shared/, analysis/, ui/)
- `lib/`:Core logic (git/, ai/, timeline/, utils/)
- `hooks/`:Custom React hooks
- `public/fonts/`:DD and JetBrains Mono fonts

## Key Design Decisions
- Dark mode default (class="dark" on html)
- Design system from devouringdetails.com (system.css merged into globals.css)
- Radial timeline is the centerpiece:preserve all gesture physics exactly
- Web Audio API sounds (no audio files):7 distinct sound types
- SSE for streaming AI analysis progress

## Demo Mode (Current)
- Hosted version uses pre-baked timeline data (no runtime API calls)
- Demo data lives in `lib/timeline/demo-repos.ts`
- Fake analysis animation in `hooks/use-fake-analysis.ts`
- Live pipeline code preserved in `app/api/`, `hooks/use-analysis-stream.ts`, `lib/ai/`

## Adding a New Timeline (for a client/request)
1. Run locally with API keys set in `.env.local` (ANTHROPIC_API_KEY, GITHUB_TOKEN)
2. Switch landing page back to live mode (use `useAnalysisStream` instead of `useFakeAnalysis`)
3. Analyze their repo:let the real 4-agent pipeline run (~30-60s)
4. Copy the resulting timeline JSON into `demo-repos.ts` as a new `DemoRepo` entry
5. Their timeline is now available at `/timeline/demo/{slug}`
6. Share the direct link:no need to go through the landing page

## Rules
- Do NOT modify radial timeline spring physics or gesture handling
- Do NOT import from prd-assets/:those are reference only
- All sounds via lib/sounds.ts:Web Audio API, no files
- WCAG compliance required on all interactive elements
- Do NOT push to remote without Edward's explicit approval:radial timeline is third-party work that requires permission from its creators before public deployment
