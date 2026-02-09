"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTheme } from "./theme-provider";
import { useSounds } from "./sound-provider";
import { playPop as rawPlayPop } from "@/lib/sounds";

export function SiteHeader({
  repoName,
  timelineId,
  hideOnScroll = false,
}: {
  repoName?: string;
  timelineId?: string;
  hideOnScroll?: boolean;
}) {
  const { theme, toggleTheme } = useTheme();
  const { muted, toggleMute, playSnap } = useSounds();
  const [scrolled, setScrolled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!hideOnScroll) return;
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideOnScroll]);

  const hideLogo = hideOnScroll && scrolled;

  return (
    <header
      className="flex items-center justify-between px-6 py-4"
      role="banner"
    >
      <motion.div
        className="flex items-center gap-3"
        animate={{
          opacity: hideLogo ? 0 : 1,
          y: hideLogo ? -12 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ pointerEvents: hideLogo ? "none" : "auto" }}
      >
        <a
          href="/"
          className="text-14 font-mono text-[color:var(--color-gray11)] hover:text-[color:var(--color-high-contrast)] transition-colors cursor-pointer"
          aria-label="Git Historian home"
        >
          git historian
        </a>
        {repoName && (
          <>
            <span className="text-[color:var(--color-gray6)]" aria-hidden="true">/</span>
            <span className="text-14 font-mono text-[color:var(--color-gray11)]">
              {repoName}
            </span>
          </>
        )}
      </motion.div>

      <div className="flex items-center gap-3">
        {/* Share button */}
        {timelineId && (
          <motion.button
            onClick={() => {
              playSnap();
              const url = `${window.location.origin}/timeline/${timelineId}`;
              navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-[color:var(--color-gray9)] hover:text-[color:var(--color-gray11)] transition-colors p-1 cursor-pointer"
            aria-label={copied ? "Link copied" : "Copy share link"}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {copied ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            )}
          </motion.button>
        )}

        {/* Theme toggle */}
        <motion.button
          onClick={() => { playSnap(); toggleTheme(); }}
          className="text-[color:var(--color-gray9)] hover:text-[color:var(--color-gray11)] transition-colors p-1 cursor-pointer"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {theme === "dark" ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </motion.button>

        {/* Mute toggle */}
        <motion.button
          onClick={() => { rawPlayPop(); toggleMute(); }}
          className="text-[color:var(--color-gray9)] hover:text-[color:var(--color-gray11)] transition-colors p-1 cursor-pointer"
          aria-label={muted ? "Unmute sounds" : "Mute sounds"}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {muted ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </motion.button>
      </div>
    </header>
  );
}
