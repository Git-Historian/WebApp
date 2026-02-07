# Git Historian

Every codebase has a story. Git Historian ingests a git repository's history and uses four AI agents (powered by Claude Opus 4.6) to generate an interactive radial timeline documentary of how the project evolved.

**Live demo:** [githistorian.edwardguillen.com](https://githistorian.edwardguillen.com)

## How It Works

1. **Paste** a public GitHub repo URL
2. **Analyze** — Four AI agents work in parallel to extract the story:
   - **Commit Analyst** — Scores significance, groups milestones
   - **Architecture Tracker** — Identifies structural shifts and stack changes
   - **Complexity Scorer** — Tracks growth rate and health over time
   - **Narrative Writer** — Crafts documentary-style narratives for each milestone
3. **Explore** — Navigate the interactive radial timeline with scroll-to-zoom, rotation, keyboard navigation, and synthesized audio feedback

## Setup

```bash
git clone git@github.com:Git-Historian/git-historian-app.git
cd git-historian
npm install
```

Create `.env.local`:

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `NEXT_PUBLIC_DEMO_REPO` | Demo repo URL (default: `https://github.com/helloluma/edwardguillen`) |
| `NEXT_PUBLIC_SITE_URL` | Deployed site URL |

```bash
npm run dev     # http://localhost:3000
npm run build   # Production build
```

## Stack

- **Next.js 15** — App Router, TypeScript, Tailwind v4
- **Claude Opus 4.6** — Four-agent analysis pipeline via Anthropic SDK
- **[Motion](https://motion.dev)** — Spring-based animations and gestures
- **Web Audio API** — 7 synthesized sound types (zero audio files)
- **simple-git** — Blobless clone and commit extraction
- **shadcn/ui** — Base component primitives

## Credits

Built by [Edward Guillen](https://edwardguillen.com) for the "Built with Opus 4.6" Claude Code Hackathon.

Radial timeline by [Rauno Freiberg](https://devouringdetails.com), [Glenn Hitchcock](https://glenn.me/), and [Andy Allen](https://x.com/asallen).

Audio design methodology referenced from [Raphael Salaja](https://www.userinterface.wiki/).
