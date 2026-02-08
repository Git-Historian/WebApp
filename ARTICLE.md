# Building Git Historian: How I Turned Git Logs Into a Documentary With Claude Code

**By Edward Guillen**

---

Every codebase has a story. The problem is, nobody reads it.

Your git log is the most honest record of how software gets built. It captures every late-night decision, every "fuck it, ship it" moment, every refactor born from regret. But git logs are ugly. They're walls of hashes and timestamps that only make sense to the person who wrote them, and even they forget after a week.

Git Historian changes that. Paste a GitHub URL, and four AI agents tear through your commit history to produce a cinematic, interactive radial timeline documentary of your project's evolution. It tells the story of your codebase the way a documentary narrator would: with drama, context, and an appreciation for the quiet moments where someone stared at a screen and decided to rebuild everything from scratch.

This is the story of how it was built. Every decision, every dead end, every "oh shit" moment included.

---

## The Stack

Let me lay out what powers this thing:

- **Next.js 16** (App Router, React 19, TypeScript) for the full-stack framework
- **Tailwind CSS v4** for styling with CSS custom properties for theming
- **Motion** (the artist formerly known as Framer Motion) for every animation on the page
- **@use-gesture/react** for gesture handling on the radial timeline
- **simple-git** for cloning and parsing repositories server-side
- **@anthropic-ai/sdk** for talking to Claude's API (the AI behind the analysis)
- **shadcn/ui** + **Radix UI** for base UI primitives
- **Vercel Analytics** for tracking
- **Web Audio API** for synthesized sound effects (zero audio files)
- **Claude Code Opus 4.6** for building approximately 90% of the application itself

4,566 lines of TypeScript, CSS, and configuration. Two git commits to the initial build. Zero audio files, zero image assets beyond a single SVG favicon.

---

## The Radial Timeline: Stealing From the Best

The centerpiece of Git Historian is the radial timeline. I didn't build it from scratch. I adapted it from the incredible work by **Rauno Freiberg**, **Glenn Hitchcock**, and **Andy Allen** on [devouringdetails.com](https://devouringdetails.com). Their system.css design system and radial timeline component are some of the best frontend work I've ever seen.

### How the Original Works

The timeline renders 180 lines (`LINE_COUNT = 180`) arranged in a circle. Each line is a tiny div, absolutely positioned around a radius using trigonometric offsets:

```typescript
const ANGLE_INCREMENT = 360 / LINE_COUNT;  // 2 degrees per line
const rotation = (index - LINE_COUNT / 4) * ANGLE_INCREMENT;
const angleRad = (rotation * Math.PI) / 180;
const offsetX = RADIUS * Math.cos(angleRad);
const offsetY = RADIUS * Math.sin(angleRad);
```

Data events are mapped to specific lines via a `degree` property. When the timeline renders, it checks each line: `data.find((i) => i.degree === index)`. If there's a match, that line becomes interactive: it's wider, clickable, and shows a label.

Scroll-based zooming handles the zoom interaction. Scroll down past 250px (`SCROLL_SNAP`) and the timeline scales up 6x, revealing a detail sheet below. The detail sheet blurs as you scroll further, creating a parallax depth effect. Spring physics drive everything: `stiffness: 150, damping: 42, mass: 1.1` for the rotation, `stiffness: 300, damping: 50` for the scale.

### What I Had to Modify

The original timeline was designed for curated, hand-placed data points. My data comes from AI analysis of arbitrary git histories. This created a fundamental mismatch that nearly killed the project.

**The Showstopper Bug: Float Degrees**

My first `buildTimeline()` function calculated degrees like this:

```typescript
degree: Math.round((i / events.length) * 179)
```

This looks reasonable until you realize that for 7 events, it produces degrees like `0, 25.57, 51.14, 76.71, 102.29, 127.86, 153.43`. The renderer matches with strict equality: `data.find((i) => i.degree === index)` where `index` is always an integer 0-179.

Floats never equal integers. Zero events rendered. Blank timeline. Silent failure.

The fix was to use the existing `transformData()` utility from the original codebase, which produces proper integer degrees with a minimum gap between events:

```typescript
export function transformData(data: TimelineData, minGap = 5): TimelineData {
  let previousIndex = 0;
  return data.map((item, index) => {
    if (index !== 0) {
      const yearDifference = item.year - data[index - 1].year;
      item.degree = yearDifference >= minGap
        ? previousIndex + yearDifference
        : previousIndex + minGap + yearDifference;
    } else {
      item.degree = 0;
    }
    previousIndex = item.degree;
    return item;
  });
}
```

I also had to cap timeline events to 30 maximum to stay within the 180-line budget. More than that and events start overlapping.

**What I Actually Changed in the Timeline**

The CLAUDE.md for this project has one inviolable rule: **Do NOT modify radial timeline spring physics or gesture handling.** The original team spent considerable effort tuning those springs. I never touched them. But I did modify other parts of the timeline to make it work for AI-generated git data:

- **Removed the focus-visible outline** on milestone labels. The original had a `2px solid` outline with `border-radius: 6px` on focused labels, which looked like a weird rectangular border floating over the radial circle. Removed it for a cleaner look.
- **Added theme-aware label colors** to the `Meta` component. The original labels inherited their color from the parent. In the Cold Obsidian dark theme, they were nearly invisible. Added explicit `--color-gray9` for names and `--color-gray7` for years.
- **Added an Enter key shortcut** to zoom into the timeline and select the nearest event. The original only supported scroll-based zoom. Now you can press Enter to zoom in and Escape to zoom back out, making the timeline fully keyboard-navigable.
- **Added a navigation hint pill** fixed at the bottom of the timeline. A small "Navigate" button that spring-animates open on hover to reveal all keyboard shortcuts: Scroll (zoom in/out), Enter (zoom in), Arrow keys (navigate events), Click (jump to event), Escape (reset view). The pill morphs from a rounded capsule to an expanded panel using border-radius animation and height transitions. No component swapping, no blank flash between states.
- **Added an auto-hiding header** that slides the "git historian" logo text out of view when you scroll into the timeline content, so the narrative isn't obscured. The theme toggle and mute toggle stay visible. Spring-animated with `stiffness: 300, damping: 25`. Scrolling back up snaps the logo back into place.
- **Redesigned the event detail card** from a commit changelog into a narrative paragraph. The original showed each commit as a separate row with hash, author, message, and diff stats. Now, the AI generates per-commit stories (`commitStories` map) that get combined into a single flowing paragraph. When you have five commits on the same milestone, they read as one chapter in a story, not five bullet points. Even without AI stories (fallback mode), the commit messages get synthesized into connected sentences with transitional phrases instead of being listed individually.
- **Added commit stats footer** below the narrative: total commits, insertions/deletions with a green/red ratio bar, and contributor count. Compact, informational, and out of the way of the story.

Everything else: the spring constants, the gesture handling, the scroll-snap zoom, the blur parallax, the rotation mechanics, the line rendering. All untouched. That's the work of Rauno, Glenn, and Andy, and it's genuinely some of the best interactive frontend engineering I've seen.

### Credit Where It's Due

The radial timeline is what makes Git Historian feel like a product instead of a tech demo. I built the AI pipeline, the data layer, and the UI chrome on top of their visualization. The fact that it works so seamlessly is a testament to how well [Rauno Freiberg](https://rauno.me), [Glenn Hitchcock](https://glenn.me), and [Andy Allen](https://x.com/asallen) designed the original component and the [devouringdetails.com](https://devouringdetails.com) system.css design system. Their work on spring physics, gesture handling, and responsive scaling gave me a foundation I could build on without fighting. I was able to create something far more intuitive and visually compelling than I could have from scratch. It just looks amazing, and that's largely their doing.

The sound design methodology comes from [Raphael Salaja](https://www.userinterface.wiki/), whose approach to Web Audio synthesis inspired every sound in the app. The idea that UI sounds should be 10-50 milliseconds of synthesized waveforms, so short they feel like physical feedback rather than notifications, completely changed how I think about audio in interfaces.

Thank you to all of them. Without their foundations, Git Historian would be a JSON dump with a progress bar.

---

## The AI Agent Pipeline

This is where the project gets interesting and expensive. When you click "Analyze," here's what happens:

### Step 1: Clone and Extract

The `/api/extract` route clones the repository as a bare repo (no working tree, faster) with a 30-second timeout:

```typescript
await git.clone(url, repoPath, ["--bare"]);
```

Then a single `git log --numstat` call extracts up to 200 commits with full diff stats in one pass. This was critical. The original implementation called `git.diffSummary()` individually for each commit, spawning a separate git process every time. For 200 commits, that's 200 child processes. It took minutes. The single `--numstat` approach does it in under a second.

### Step 2: Four AI Agents, Two Phases

The `/api/analyze` route receives the commits and runs them through four Claude-powered agents:

**Phase 1 (Parallel):**

1. **Commit Analyst** scores each commit's significance (1-10), categorizes it (feature, bugfix, refactor, etc.), and groups related commits into named milestones like "Authentication System" or "API v2 Migration."

2. **Architecture Tracker** identifies structural changes: new frameworks added, directory restructures, database migrations, build system changes. It produces 5-20 architecture events.

3. **Complexity Scorer** generates complexity snapshots at intervals through the project timeline: file counts, line counts, growth rates, health scores, refactoring ratios.

These three run in parallel via `Promise.allSettled()`, so one agent failing doesn't kill the others.

**Phase 2 (Sequential):**

4. **Narrative Writer** takes the combined output from agents 1-3 plus the raw commit log and writes the documentary. This agent produces cinematic era narratives (3-6 eras covering the full project timeline) and per-commit stories that explain what each commit really means.

The narrative writer's prompt is the most heavily iterated piece of the entire project:

```
You are a world-class documentary narrator telling the story of a codebase's
evolution. Think Ken Burns meets Silicon Valley. Every repository has drama,
ambition, setbacks, and breakthroughs hiding in its commit log.
```

It generates `commitStories`: a map of commit hashes to 1-2 sentence narratives. Instead of showing "deploy new portfolio" as a raw commit message, the AI writes something like: "The first version hits the world. After days of local tweaks, someone finally pulled the trigger and shipped it live."

When multiple commits happen on the same day or belong to the same milestone, their stories get combined into a single flowing paragraph on the timeline. The whole point is storytelling. Five commits on a Tuesday shouldn't show as five bullet points. They should read as one chapter in a story.

### Step 3: SSE Streaming

The analysis streams progress back to the frontend via Server-Sent Events. Each agent reports status updates (`agent_start`, `agent_thinking`, `agent_complete`) that drive the progress UI in real time. A 10-second heartbeat keeps the connection alive during long AI calls, because Vercel's edge network aggressively closes idle connections.

```typescript
const heartbeat = setInterval(() => {
  controller.enqueue(encoder.encode(": heartbeat\n\n"));
}, 10_000);
```

The frontend detects premature stream closure: if the SSE stream ends without a `pipeline_complete` event, it shows a timeout error instead of leaving the user staring at stuck progress bars forever.

---

## The Sound Design

Every interaction in Git Historian has a sound. Not a single audio file exists in the project. All 7 sound types are synthesized in real-time using the Web Audio API:

- **Tick**: Filtered white noise burst (10ms), plays when hovering over empty timeline lines
- **Swoosh**: Frequency-swept bandpass noise, plays on zoom in/out (up/down variants)
- **Snap**: Tick + low sine pop, plays on timeline zoom snap and theme toggle
- **Pop**: Descending sine (800Hz to 400Hz in 50ms), plays on hover over data points and agent start
- **Step**: Triangle wave at 1200Hz (15ms), plays on arrow key navigation

The audio methodology comes from **Raphael Salaja's** work on [userinterface.wiki](https://www.userinterface.wiki/). The key insight: sounds should be so short they feel like physics, not UI feedback. A 10-millisecond noise burst doesn't sound like a notification. It sounds like something clicked into place.

```typescript
export function playTick(pitchVariation = 0) {
  const ctx = getContext();
  const bufferSize = ctx.sampleRate * 0.01;  // 10ms of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;  // White noise
  }
  // ... bandpass filter at 3000Hz, gain envelope
}
```

---

## The Color System: Cold Obsidian and Cool Paper

The app ships with two themes, both designed from scratch:

**Dark Mode (Cold Obsidian)**: Nearly-black backgrounds (`#08090c`, `#10121a`) with blue-shifted grays and a cool blue accent (`#6b8aff`). The surface has a subtle radial glow: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(80, 100, 200, 0.06) 0%, transparent 70%)`. It's barely perceptible but it makes the page feel like it has depth.

**Light Mode (Cool Paper)**: Warm paper whites (`#f4f5f9`) with lavender-shifted neutrals and a deeper blue accent (`#4d6ef5`). Borders are translucent blue-gray: `rgba(100, 110, 160, 0.15)`.

Both themes share intermediate CSS custom properties (`--theme-accent`, `--surface-glow`, etc.) that the ThemeProvider toggles by setting `data-theme="dark"` on the HTML element. Theme preference persists in localStorage and respects the system `prefers-color-scheme` on first visit.

---

## The UI Journey: Death by a Thousand Progress Bars

The most painful part of this build wasn't the AI pipeline or the timeline integration. It was the progress bar.

I went through five iterations of the analysis progress bar animation before it stopped "jolting":

1. **Spring transition** caused visual overshoot. Switched to ease-out tween.
2. **motion.div animate** restarts the animation on every value change. The bar would jolt backwards on each progress update. Switched to CSS `transition`.
3. **Switching between components** (shimmer div during cloning, progress div during analysis) caused unmount/remount visual resets. Unified to a single bar with a `maxRef` to prevent backwards movement.
4. **Width reset**: The cloning phase used `width: 100%` for a shimmer effect. Transitioning to analysis started at `width: 0%`. That 100-to-0 jump was visible. Separated into a track pulse overlay (no width animation) and a fill bar that only renders when progress > 0.
5. **Diagonal stripe animation** (`stripe-slide`) using `translateX` didn't loop cleanly because the pattern repeat distance didn't match the translation distance. Replaced with `bar-shimmer` using `background-position` sweep.

Five iterations. For a progress bar. The lesson: animated UI elements that update frequently are brutally hard to get right, because every state transition is a potential visual glitch.

### The React useEffect Gotcha

Another bug that cost hours: the analyze page had a `useEffect` with `phase` in its dependency array. The effect body set `phase` via `setPhase()` and used `setTimeout` for the transition animation. When `phase` changed, the effect re-ran, cleanup fired, and killed the timer before it could complete.

The fix was splitting the effect into two separate effects: one that triggers the sound and phase change on `isComplete`, and another that handles the timed navigation on `phase === "transitioning"`. Never put a state variable in a useEffect's dependencies if the effect sets that same variable and uses a timer. The state change triggers cleanup, which kills the timer. It's a React footgun that's obvious in hindsight and invisible until you've been staring at it for an hour.

---

## The Cost Reality

Let's talk about money, because this is the part nobody wants to hear.

Building Git Historian cost approximately **$2.36** in Claude Code API usage for a multi-hour session that included:
- Complete UI overhaul (two color themes, redesigned components)
- AI pipeline debugging and optimization
- Multiple iterations of animation fixes
- SEO metadata setup
- Sound effect integration
- Header scroll behavior
- Event detail card redesign

That's the cost of the **development session using Claude Code Opus 4.6 as the coding assistant**. Claude Code is the CLI tool that reads your codebase, understands context, and writes/edits code for you. It's mind-blowingly powerful and mind-blowingly expensive relative to traditional development tools (which cost $0 in API fees).

Then there's the per-analysis cost. Every time a user analyzes a repository, the app makes four separate Claude API calls (using Sonnet, not Opus, because Opus would be absurdly expensive for structured JSON extraction). Each analysis runs roughly:
- 3 parallel agent calls (Commit Analyst, Architecture Tracker, Complexity Scorer)
- 1 sequential agent call (Narrative Writer, which needs results from the other three)

For a repository with 100-150 commits, this costs approximately **$0.05-0.15 per analysis** depending on commit density and file counts. The initial version used Opus for the agents. That would have been $0.50+ per analysis. Sonnet is 5-10x cheaper and more than sufficient for structured JSON extraction.

The development cost is real too. Claude Code Opus 4.6 is the most capable coding model available, but it's also the most expensive. At scale, building with it adds up. For a hackathon project, $2.36 is trivial. For a production product with a team, those costs compound fast.

---

## What Went Wrong (The Downsides)

### 1. Git Clone Performance

Cloning repositories server-side is inherently slow. A bare clone of a medium-sized repo (500+ commits) takes 5-15 seconds. The original implementation used `--filter=blob:none` (partial clone) to speed things up, but it actually made things worse: every `diffSummary()` call had to fetch blobs over the network individually, turning a 5-second clone into a 60-second extraction.

The fix was using bare clones (`--bare`) and a single `git log --numstat` call. But cloning will always be the bottleneck for large repos, and there's no clean way around it without a GitHub API-based approach (which has its own rate limit problems).

### 2. AI Hallucination in Narratives

The narrative writer sometimes fabricates details that aren't in the commit log. It'll describe "the team's decision to migrate from REST to GraphQL" when no such migration happened. The prompt engineering helps, but it's not bulletproof. The model is filling narrative gaps with plausible-sounding stories. For a documentary-style product, this is a real credibility problem.

### 3. Token Limits and Large Repos

Repositories with 500+ commits exceed the context window for a single Claude API call. The current approach caps at 200 commits for extraction and sends 100 to the narrative writer. For large, long-lived repositories, this means the AI only sees the most recent 100 commits and misses years of early history. The right solution would be chunking and summarization, but that adds complexity and cost.

### 4. Vercel Timeouts

The extract route has a 60-second `maxDuration` and the analyze route has 120 seconds. Large repositories can exceed these limits, especially if Claude's API is slow. When timeouts hit, the SSE stream closes silently and the frontend detects it as "stream ended unexpectedly." It works, but it's not a great experience.

### 5. No Caching

Every analysis is run from scratch. There's no persistence layer. If you analyze the same repo twice, it clones and processes everything again. Adding a database (Supabase, Turso, etc.) to cache results would be the obvious next step, but it wasn't in scope for the hackathon.

### 6. Single-User Architecture

The app clones repos to `/tmp` on the server filesystem. In a serverless environment (Vercel), this works because each function invocation has its own ephemeral filesystem. But it doesn't scale to concurrent users well. Two users analyzing the same repo would clone it twice. A job queue with shared storage would be better.

---

## The Claude Code Experience

This project was built for the "Built with Opus 4.6" Claude Code Hackathon, and the honest truth is: Claude Code wrote about 90% of the code. Here's what that actually looks like in practice:

1. **Scaffolding**: I described the project concept and Claude Code generated the initial file structure, components, API routes, and pipeline logic.

2. **Iteration**: Most of the work was iterative refinement. "The progress bar jolts." "Make the commits tell a story." "The header gets in the way when scrolling." Each instruction triggered Claude Code to read the relevant files, understand the context, and make targeted edits.

3. **Debugging**: When things broke (the float degree bug, the useEffect timer issue), I described the symptom and Claude Code traced through the code to find root causes. It identified that `data.find(i => i.degree === index)` with integer indices would never match float degrees, which I hadn't caught in code review.

4. **Design implementation**: I provided HTML mockups in a `color-scheme-update/` folder and Claude Code translated them into React components with the correct Tailwind classes, CSS custom properties, and motion animations.

5. **Sound design**: The Web Audio API synthesis was generated entirely by Claude Code based on descriptions like "a short tick sound" and "a swoosh that sweeps frequency up." It understood the AudioContext API, oscillator types, gain envelopes, and filter parameters.

What Claude Code is bad at (at least for this project):

- **Visual judgment**: It can't see the page. When I said "the progress bar jolts," it took five iterations because it couldn't observe the visual artifact, only reason about the code. Each fix was technically sound but addressed a different root cause than the actual problem.

- **Animation tuning**: Spring parameters (`stiffness: 150, damping: 20, mass: 0.6`) need visual tuning. Claude Code can generate reasonable defaults but can't tell if the animation "feels" right. That requires human eyes.

- **Cost estimation**: It doesn't naturally flag when an architectural decision (like using Opus for agent calls) will be expensive at scale. You have to know to ask.

---

## Architecture Diagram

```
User enters GitHub URL
        |
        v
[Landing Page] ----POST----> [/api/extract]
                                    |
                                    v
                              git clone --bare
                              git log --numstat
                                    |
                                    v
                              RawCommit[] (max 200)
                                    |
        <----- JSON response -------+
        |
        v
[Analyze Page] ----POST----> [/api/analyze]
        |                           |
   SSE Stream <-------+       [runPipeline()]
        |             |             |
   AgentGrid UI       |     Phase 1 (parallel):
   updates in         |       - Commit Analyst
   real-time          +---->  - Architecture Tracker
        |             |       - Complexity Scorer
        |             |             |
        |             |     Phase 2 (sequential):
        |             +---->  - Narrative Writer
        |                           |
        |                     buildTimeline()
        |                     transformData()
        |                           |
        v                           v
   pipeline_complete ---------> TimelineEvent[]
        |
        v
   sessionStorage.setItem()
   router.push("/timeline")
        |
        v
[Timeline Page]
   sessionStorage.getItem()
        |
        v
   <RadialTimeline data={...} />
        |
        +--- <Line /> x 180 (positioned around circle)
        |      +--- <Meta /> (labels for data points)
        |
        +--- <Sheet /> (detail panel below timeline)
               +--- <EventDetail /> (narrative + commit stories)
```

---

## Key Files

| File | Lines | Purpose |
|------|-------|---------|
| `components/timeline/radial-timeline.tsx` | 430 | Core timeline: scroll zoom, rotation, gesture handling, keyboard shortcuts |
| `components/timeline/line.tsx` | 105 | Individual timeline line with click/hover interactions |
| `components/timeline/sheet.tsx` | 55 | Detail panel that appears on zoom |
| `components/timeline/event-detail.tsx` | 155 | Narrative paragraphs + commit stats for timeline events |
| `components/timeline/nav-hint.tsx` | 103 | Spring-animated navigation shortcut pill |
| `lib/ai/pipeline.ts` | 300 | AI pipeline orchestration + timeline building |
| `lib/ai/agents.ts` | 199 | Four AI agent prompts and Claude API calls |
| `lib/git/extractor.ts` | 107 | Git clone + commit extraction |
| `hooks/use-analysis-stream.ts` | 197 | SSE client for streaming analysis progress |
| `app/api/analyze/route.ts` | 77 | SSE endpoint for analysis pipeline |
| `lib/sounds.ts` | 124 | Web Audio API sound synthesis (7 sound types) |
| `app/globals.css` | ~400 | Design system: themes, animations, keyframes |
| `components/shared/site-header.tsx` | 135 | Auto-hiding header with theme/mute toggles |
| `components/shared/theme-provider.tsx` | 61 | Dark/light mode with localStorage persistence |
| `components/analysis/agent-grid.tsx` | 170 | Progress dashboard during analysis |
| `components/analysis/agent-panel.tsx` | 211 | Individual agent status cards |

---

## How to Run It

```bash
# Clone the repo
git clone <repo-url>
cd git-historian

# Install dependencies
npm install

# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-...

# Start dev server
npm run dev
```

Open `http://localhost:3000`, paste any public GitHub repo URL, and watch the story unfold.

---

## What's Next

If I keep building this, here's what I'd add:

1. **Result caching** with a database (Supabase or Turso) so repeat analyses are instant
2. **Chunked analysis** for large repos (summarize in windows, then synthesize)
3. **Export to PDF/video** so teams can share their project's story
4. **Multi-repo comparison** timelines showing how projects evolved together
5. **Contributor spotlight** mode that focuses the narrative on individual developers
6. **Cost optimization** with prompt caching and smaller models for simpler tasks

---

## Want the Code?

The complete codebase is open for sharing. If you'd like to run Git Historian yourself, fork it, or build on top of it, email me and I'll send it over.

**Edward Guillen** | [edwardguillen.com](https://edwardguillen.com)

---

*Developed and designed by Edward Guillen with [Claude Code Opus 4.6](https://claude.ai/claude-code). Radial timeline by Rauno Freiberg, Glenn Hitchcock, and Andy Allen. Audio methodology from Raphael Salaja.*
