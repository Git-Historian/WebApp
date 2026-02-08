"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const shortcuts = [
  { keys: ["Scroll"], label: "Zoom in & out" },
  { keys: ["\u2190", "\u2192"], label: "Navigate events" },
  { keys: ["Click"], label: "Jump to event" },
  { keys: ["Esc"], label: "Reset view" },
];

export function NavHint() {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 200, damping: 25 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <motion.div
        className="overflow-hidden rounded-full border border-[color:var(--color-gray4)] bg-[color:var(--color-gray2)] cursor-pointer shadow-[var(--shadow-medium)]"
        animate={{
          borderRadius: open ? 12 : 9999,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={() => setOpen((v) => !v)}
      >
        <motion.div
          className="flex items-center gap-2 px-4 py-2"
          animate={{ opacity: open ? 0 : 1, height: open ? 0 : "auto" }}
          transition={{ duration: 0.1 }}
          style={{ pointerEvents: open ? "none" : "auto" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[color:var(--color-gray9)]"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="text-12 text-[color:var(--color-gray9)]">
            Navigate
          </span>
        </motion.div>

        <AnimatePresence>
          {open && (
            <motion.div
              className="flex items-center gap-6 px-5 py-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              {shortcuts.map((shortcut, i) => (
                <motion.div
                  key={shortcut.label}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: i * 0.03,
                  }}
                >
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key) => (
                      <kbd
                        key={key}
                        className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-4 border border-[color:var(--color-gray5)] bg-[color:var(--color-gray3)] text-11 font-mono text-[color:var(--color-gray11)]"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                  <span className="text-12 text-[color:var(--color-gray9)] whitespace-nowrap">
                    {shortcut.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
