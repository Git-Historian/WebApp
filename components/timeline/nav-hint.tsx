"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

/*──────────────────────────────────────────────────────────────────────────────
  Git Historian - Navigation Dock
  Morphing surface: compact pill → two-row keyboard shortcut legend.
  Built on Rauno Freiberg's Morph Surface spring pattern.
──────────────────────────────────────────────────────────────────────────────*/

const SPRING_CONFIG = {
  type: "spring" as const,
  stiffness: 550,
  damping: 45,
  mass: 0.7,
};

const LOGO_SPRING = {
  type: "spring" as const,
  stiffness: 350,
  damping: 35,
};

const ROW_1 = [
  { keys: ["Scroll"], label: "Zoom in & out" },
  { keys: ["Enter"], label: "Zoom in" },
  { keys: ["\u2190", "\u2192"], label: "Navigate events" },
];

const ROW_2 = [
  { keys: ["Click"], label: "Jump to event" },
  { keys: ["Esc"], label: "Reset view" },
];

const COLLAPSED_W = 170;
const COLLAPSED_H = 44;
const EXPANDED_W = 500;
const EXPANDED_H = 100;

/* ─── Question-circle icon ─────────────────────────────────────────────────── */
function QuestionIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.2" />
      <text
        x="9"
        y="12.5"
        textAnchor="middle"
        fill="currentColor"
        fontSize="10"
        fontWeight="500"
        fontFamily="sans-serif"
      >
        ?
      </text>
    </svg>
  );
}

/* ─── Shortcut item ────────────────────────────────────────────────────────── */
function ShortcutItem({
  shortcut,
  index,
}: {
  shortcut: { keys: string[]; label: string };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.04 + index * 0.035,
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className="flex items-center gap-2"
    >
      <div className="flex items-center gap-1">
        {shortcut.keys.map((key) => {
          const isWord = key.length > 2;
          return (
            <kbd
              key={key}
              className="inline-flex items-center justify-center h-6 rounded-4 font-mono font-medium select-none whitespace-nowrap leading-none tracking-[0.02em] bg-[color:var(--color-gray3)] border border-[color:var(--color-gray5)] text-[color:var(--color-gray11)] backdrop-blur-sm"
              style={{
                minWidth: isWord ? "auto" : 24,
                padding: isWord ? "0 8px" : "0 5px",
                fontSize: isWord ? 11 : 12,
              }}
            >
              {key}
            </kbd>
          );
        })}
      </div>
      <span className="text-12 text-[color:var(--color-gray9)] whitespace-nowrap tracking-[0.01em]">
        {shortcut.label}
      </span>
    </motion.div>
  );
}

/* ─── Exported dock ────────────────────────────────────────────────────────── */
export function NavHint() {
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Click outside → close
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setExpanded(false);
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  // Esc → close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <motion.div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 200, damping: 25 }}
    >
      <motion.div
        ref={rootRef}
        className="relative overflow-hidden bg-[color:var(--color-gray2)] border border-[color:var(--color-gray5)]"
        style={{
          boxShadow: expanded
            ? "var(--shadow-medium), inset 0 1px 0 var(--color-gray4)"
            : "var(--shadow-small), inset 0 1px 0 var(--color-gray4)",
          cursor: expanded ? "default" : "pointer",
        }}
        initial={false}
        animate={{
          width: expanded ? EXPANDED_W : COLLAPSED_W,
          height: expanded ? EXPANDED_H : COLLAPSED_H,
          borderRadius: expanded ? 14 : 22,
        }}
        transition={{ ...SPRING_CONFIG, delay: expanded ? 0 : 0.06 }}
        onClick={() => !expanded && setExpanded(true)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label="Keyboard shortcuts"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
      >
        {/* Surface glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "var(--surface-glow)",
            borderRadius: "inherit",
          }}
        />

        {/* ── Collapsed ── */}
        <AnimatePresence>
          {!expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center gap-2 h-full px-5 select-none text-[color:var(--color-gray9)]"
            >
              <motion.div layoutId="nav-indicator" transition={LOGO_SPRING}>
                <QuestionIcon />
              </motion.div>
              <span className="text-14 font-medium tracking-[0.01em]">
                Navigate
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Expanded (two rows) ── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                ...SPRING_CONFIG,
                opacity: { delay: 0.05, duration: 0.2 },
              }}
              className="flex flex-col items-center justify-center gap-2.5 h-full px-5 absolute inset-0"
            >
              {/* Morphed indicator dot */}
              <motion.div
                layoutId="nav-indicator"
                transition={LOGO_SPRING}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)]"
              />

              {/* Row 1 */}
              <div className="flex items-center gap-5">
                {ROW_1.map((shortcut, i) => (
                  <ShortcutItem key={shortcut.label} shortcut={shortcut} index={i} />
                ))}
              </div>

              {/* Row 2 */}
              <div className="flex items-center gap-5">
                {ROW_2.map((shortcut, i) => (
                  <ShortcutItem
                    key={shortcut.label}
                    shortcut={shortcut}
                    index={i + ROW_1.length}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
