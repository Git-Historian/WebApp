"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { StaggeringText } from "@/components/shared/staggering-text";
import { SiteHeader } from "@/components/shared/site-header";
import { useSounds } from "@/components/shared/sound-provider";

function AnimatedLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      className="relative inline-block text-[color:var(--color-gray11)] hover:text-[color:var(--color-high-contrast)] transition-colors cursor-pointer"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      <AnimatePresence>
        {hovered && (
          <motion.span
            className="absolute bottom-0 left-0 h-px w-full bg-current"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{ originX: 0 }}
          />
        )}
      </AnimatePresence>
    </a>
  );
}

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
  const { playSnap } = useSounds();
  const [repoUrl, setRepoUrl] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [headlineRevealed, setHeadlineRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeadlineRevealed(true), 400);
    return () => clearTimeout(timer);
  }, []);

  function handleAnalyze(url?: string) {
    const targetUrl = url || repoUrl;
    if (!targetUrl.trim()) return;
    setIsNavigating(true);
    playSnap();
    router.push(`/analyze?repo=${encodeURIComponent(targetUrl)}`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Surface glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--surface-glow)" }}
        aria-hidden="true"
      />

      <div className="max-w-5xl w-full mx-auto relative z-10">
        <SiteHeader />
      </div>

      {/* Hero */}
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center px-6 pb-20 relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 0.88, 0.26, 0.92] }}
        >
          <div className="flex justify-center mb-6">
            <StaggeringText hover={headlineRevealed} className="text-48 max-sm:text-32 [&>span]:inline-block -tracking-[1px] font-medium text-[color:var(--color-high-contrast)]">
              Every codebase has a story.
            </StaggeringText>
          </div>

          <motion.p
            className="text-18 max-sm:text-16 text-[color:var(--color-gray9)] leading-28 max-w-xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Paste a GitHub repo and watch AI agents transform its git history
            into an interactive radial timeline documentary.
          </motion.p>

          {/* URL Input */}
          <motion.form
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            onSubmit={(e) => {
              e.preventDefault();
              handleAnalyze();
            }}
          >
            <input
              type="url"
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="flex-1 h-11 px-4 rounded-[10px] bg-[color:var(--card)] border border-[color:var(--border)] text-[color:var(--color-high-contrast)] placeholder:text-[color:var(--color-gray9)] font-mono text-13 shadow-[var(--shadow-small)] transition-colors focus:border-[color:var(--theme-accent)]"
              aria-label="GitHub repository URL"
              disabled={isNavigating}
              autoComplete="url"
            />
            <motion.button
              type="submit"
              disabled={!repoUrl.trim() || isNavigating}
              className="h-11 px-6 rounded-[10px] bg-[color:var(--card)] border border-[color:var(--border)] text-[color:var(--color-high-contrast)] font-semibold text-13 cursor-pointer shadow-[var(--shadow-small)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:border-[color:var(--theme-accent)] hover:text-[color:var(--theme-accent)] hover:bg-[color:var(--hover-row,transparent)]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              Analyze
            </motion.button>
          </motion.form>

        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          role="list"
          aria-label="How it works"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
              role="listitem"
            >
              <span className="text-12 font-mono text-[color:var(--theme-accent)] mb-2 block" aria-hidden="true">
                {step.number}
              </span>
              <h3 className="text-18 font-medium text-[color:var(--color-high-contrast)] mb-1">
                {step.title}
              </h3>
              <p className="text-14 text-[color:var(--color-gray9)] leading-20">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
        {/* Disclaimer */}
        <motion.div
          className="max-w-xl mx-auto mt-20 rounded-12 border border-[color:var(--border)] px-6 py-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <p className="text-13 text-[color:var(--color-gray9)] leading-22 text-center">
            <span className="text-[color:var(--color-gray11)] font-medium">A proof of concept.</span>{" "}
            Git Historian analyzes the latest 200 commits of any public GitHub repository.
            It&apos;s a demonstration of how AI agents can transform git history into narrative
            documentation, not a production tool for massive codebases like React or Linux.
            Think of it as a theory on what&apos;s possible.
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 relative z-10" role="contentinfo">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-12 text-[color:var(--color-gray9)] leading-20 mb-3">
            Developed and designed by{" "}
            <AnimatedLink href="https://edwardguillen.com">
              Edward Guillen
            </AnimatedLink>{" "}
            with{" "}
            <AnimatedLink href="https://claude.ai/claude-code">
              Claude Code Opus 4.6
            </AnimatedLink>
          </p>
          <p className="text-12 text-[color:var(--color-gray9)] leading-20">
            Radial timeline by{" "}
            <AnimatedLink href="https://devouringdetails.com">
              Rauno Freiberg
            </AnimatedLink>
            ,{" "}
            <AnimatedLink href="https://glenn.me/">
              Glenn Hitchcock
            </AnimatedLink>{" "}
            &amp;{" "}
            <AnimatedLink href="https://x.com/asallen">
              Andy Allen
            </AnimatedLink>
            {" "}&middot;{" "}
            Audio methodology from{" "}
            <AnimatedLink href="https://www.userinterface.wiki/">
              Raphael Salaja
            </AnimatedLink>
          </p>
        </div>
      </footer>
    </div>
  );
}
