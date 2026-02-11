"use client";

import Link from "next/link";
import { motion } from "motion/react";

interface ProjectNavProps {
  prev: { slug: string; label: string } | null;
  next: { slug: string; label: string } | null;
}

export function ProjectNav({ prev, next }: ProjectNavProps) {
  if (!prev && !next) return null;

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, type: "spring", stiffness: 200, damping: 25 }}
      aria-label="Project navigation"
    >
      <div className="flex items-end justify-between px-6 pb-6 max-w-screen-xl mx-auto">
        {/* Previous */}
        {prev ? (
          <Link
            href={`/analyze?demo=${prev.slug}`}
            className="group pointer-events-auto flex flex-col gap-1"
          >
            <span className="text-11 uppercase tracking-[0.08em] font-medium text-[color:var(--color-gray8)] group-hover:text-[color:var(--color-gray9)] transition-colors">
              Previous
            </span>
            <span className="text-14 font-medium text-[color:var(--color-gray10)] group-hover:text-[color:var(--color-high-contrast)] transition-colors relative">
              {prev.label}
              <motion.span
                className="absolute -bottom-0.5 left-0 h-px w-full bg-current origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            </span>
          </Link>
        ) : (
          <div />
        )}

        {/* Next */}
        {next ? (
          <Link
            href={`/analyze?demo=${next.slug}`}
            className="group pointer-events-auto flex flex-col items-end gap-1"
          >
            <span className="text-11 uppercase tracking-[0.08em] font-medium text-[color:var(--color-gray8)] group-hover:text-[color:var(--color-gray9)] transition-colors">
              Next
            </span>
            <span className="text-14 font-medium text-[color:var(--color-gray10)] group-hover:text-[color:var(--color-high-contrast)] transition-colors relative">
              {next.label}
              <motion.span
                className="absolute -bottom-0.5 left-0 h-px w-full bg-current origin-right"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </motion.nav>
  );
}
