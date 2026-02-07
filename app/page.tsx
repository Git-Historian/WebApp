"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { StaggeringText } from "@/components/shared/staggering-text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSounds } from "@/components/shared/sound-provider";

const DEMO_REPO =
  process.env.NEXT_PUBLIC_DEMO_REPO ||
  "https://github.com/helloluma/edwardguillen";

const steps = [
  {
    number: "01",
    title: "Paste",
    description: "Drop in any public GitHub repo URL",
  },
  {
    number: "02",
    title: "Analyze",
    description: "Four AI agents extract the story from your git history",
  },
  {
    number: "03",
    title: "Explore",
    description:
      "Navigate an interactive radial timeline of your project's evolution",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { playPop, playSnap } = useSounds();
  const [repoUrl, setRepoUrl] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  function handleAnalyze(url?: string) {
    const targetUrl = url || repoUrl;
    if (!targetUrl.trim()) return;
    setIsNavigating(true);
    playSnap();
    router.push(`/analyze?repo=${encodeURIComponent(targetUrl)}`);
  }

  function handleDemo() {
    playPop();
    handleAnalyze(DEMO_REPO);
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg)] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl w-full mx-auto">
        <span className="text-14 font-mono text-[color:var(--color-gray11)]">
          git historian
        </span>
        <MuteToggle />
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 0.88, 0.26, 0.92] }}
        >
          <div className="flex justify-center mb-6">
            <StaggeringText className="text-48 max-sm:text-32 [&>span]:inline-block -tracking-[1px] font-medium text-[color:var(--color-high-contrast)]">
              Every codebase has a story.
            </StaggeringText>
          </div>

          <motion.p
            className="text-18 max-sm:text-16 text-[color:var(--color-gray11)] leading-28 max-w-xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Paste a GitHub repo and watch AI agents transform its git history
            into an interactive radial timeline documentary.
          </motion.p>

          {/* URL Input */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Input
              type="url"
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAnalyze();
              }}
              className="flex-1 h-11 bg-[color:var(--color-gray2)] border-[color:var(--color-gray4)] text-[color:var(--color-high-contrast)] placeholder:text-[color:var(--color-gray9)] font-mono text-14"
              aria-label="GitHub repository URL"
              disabled={isNavigating}
            />
            <Button
              onClick={() => handleAnalyze()}
              disabled={!repoUrl.trim() || isNavigating}
              className="h-11 px-6 bg-[color:var(--color-orange)] hover:bg-[color:var(--color-orange-bg2)] text-white font-medium"
            >
              Analyze
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <button
              onClick={handleDemo}
              disabled={isNavigating}
              className="text-14 text-[color:var(--color-orange)] hover:underline underline-offset-4 disabled:opacity-50"
            >
              Try Demo &rarr;
            </button>
          </motion.div>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
            >
              <span className="text-12 font-mono text-[color:var(--color-orange)] mb-2 block">
                {step.number}
              </span>
              <h3 className="text-18 font-medium text-[color:var(--color-high-contrast)] mb-1">
                {step.title}
              </h3>
              <p className="text-14 text-[color:var(--color-gray11)] leading-20">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-[color:var(--color-gray3)]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-12 text-[color:var(--color-gray9)] leading-20 mb-3">
            Built by{" "}
            <a
              href="https://edwardguillen.com"
              className="text-[color:var(--color-gray11)] hover:text-[color:var(--color-high-contrast)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Edward Guillen
            </a>{" "}
            for the &ldquo;Built with Opus 4.6&rdquo; Claude Code Hackathon
          </p>
          <p className="text-12 text-[color:var(--color-gray9)] leading-20">
            Radial timeline designed with{" "}
            <a
              href="https://glenn.me/"
              className="text-[color:var(--color-gray11)] hover:text-[color:var(--color-high-contrast)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Glenn Hitchcock
            </a>{" "}
            &amp;{" "}
            <a
              href="https://x.com/asallen"
              className="text-[color:var(--color-gray11)] hover:text-[color:var(--color-high-contrast)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Andy Allen
            </a>
            {" "}&middot;{" "}
            Audio methodology from{" "}
            <a
              href="https://www.userinterface.wiki/"
              className="text-[color:var(--color-gray11)] hover:text-[color:var(--color-high-contrast)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Raphael Salaja
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function MuteToggle() {
  const { muted, toggleMute } = useSounds();

  return (
    <button
      onClick={toggleMute}
      className="text-14 text-[color:var(--color-gray9)] hover:text-[color:var(--color-gray11)] transition-colors"
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
    >
      {muted ? (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  );
}
