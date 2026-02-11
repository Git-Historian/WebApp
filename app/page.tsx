"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { StaggeringText } from "@/components/shared/staggering-text";
import { SiteHeader } from "@/components/shared/site-header";
import { useSounds } from "@/components/shared/sound-provider";
import { DEMO_REPOS } from "@/lib/timeline/demo-repos";

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
    title: "Select",
    description: "Choose a repository from the curated collection",
  },
  {
    number: "02",
    title: "Analyze",
    description: "Watch four AI agents extract the story from git history",
  },
  {
    number: "03",
    title: "Explore",
    description:
      "Navigate an interactive radial timeline of the project\u2019s evolution",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { playSnap, playPop } = useSounds();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [headlineRevealed, setHeadlineRevealed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setHeadlineRevealed(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  const selectedRepo = DEMO_REPOS.find((r) => r.slug === selectedSlug);

  function handleAnalyze() {
    if (!selectedSlug) return;
    setIsNavigating(true);
    playSnap();
    router.push(`/analyze?demo=${encodeURIComponent(selectedSlug)}`);
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
            Select a repository and watch AI agents transform its git history
            into an interactive radial timeline documentary.
          </motion.p>

          {/* Repo selector + Analyze button */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full mx-auto mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {/* Custom dropdown */}
            <div className="relative w-auto" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen((o) => !o);
                  playPop();
                }}
                disabled={isNavigating}
                className="w-[220px] h-11 px-4 rounded-[10px] bg-[color:var(--card)] border border-[color:var(--border)] text-left font-mono text-[13px] sm:text-13 shadow-[var(--shadow-small)] transition-colors outline-none focus:border-[color:var(--theme-accent)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-between gap-2"
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
              >
                <span
                  className={
                    selectedRepo
                      ? "text-[color:var(--color-high-contrast)] truncate"
                      : "text-[color:var(--color-gray9)] truncate"
                  }
                >
                  {selectedRepo
                    ? selectedRepo.label
                    : "Select a repository\u2026"}
                </span>
                {/* Chevron */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`shrink-0 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[color:var(--color-gray9)]"
                  />
                </svg>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 28,
                    }}
                    className="absolute left-0 z-50 mt-2 w-auto rounded-[10px] bg-[color:var(--card)] border border-[color:var(--border)] shadow-[var(--shadow-medium)] overflow-hidden"
                    role="listbox"
                    aria-label="Select a repository"
                  >
                    {DEMO_REPOS.map((repo) => (
                      <li
                        key={repo.slug}
                        role="option"
                        aria-selected={selectedSlug === repo.slug}
                        onClick={() => {
                          setSelectedSlug(repo.slug);
                          setDropdownOpen(false);
                          playSnap();
                        }}
                        className={`px-4 py-3 cursor-pointer transition-colors ${
                          selectedSlug === repo.slug
                            ? "bg-[color:var(--theme-accent-subtle)]"
                            : "hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-13 font-medium transition-colors ${
                                selectedSlug === repo.slug
                                  ? "text-[color:var(--theme-accent)]"
                                  : "text-[color:var(--color-gray11)]"
                              }`}
                            >
                              {repo.label}
                            </span>
                            <span className="text-12 text-[color:var(--color-gray9)]">
                              {repo.description}
                            </span>
                          </div>
                          {selectedSlug === repo.slug && (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" aria-hidden="true">
                              <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              type="button"
              onClick={handleAnalyze}
              disabled={!selectedSlug || isNavigating}
              className="w-full sm:w-auto h-11 px-6 rounded-[10px] bg-[color:var(--card)] border border-[color:var(--border)] text-[color:var(--color-high-contrast)] font-semibold text-13 cursor-pointer shadow-[var(--shadow-small)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:border-[color:var(--theme-accent)] hover:text-[color:var(--theme-accent)] hover:bg-[color:var(--hover-row,transparent)]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              Analyze
            </motion.button>
          </motion.div>

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
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[color:var(--theme-accent)]/10 text-12 font-mono text-[color:var(--theme-accent)] mb-3" aria-hidden="true">
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
          className="max-w-lg mx-auto mt-16 rounded-8 border border-[color:var(--border)] px-4 py-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <p className="text-12 text-[color:var(--color-gray9)] leading-20 text-center">
            <span className="text-[color:var(--color-gray11)] font-medium">A proof of concept.</span>{" "}
            This demo showcases how AI agents can transform any public GitHub
            repository&apos;s git history into an interactive narrative timeline.
            Currently optimized for select repositories due to API rate limits
            in the hosted environment.
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
