"use client";

import { motion } from "motion/react";
import RadialTimeline from "@/components/timeline/radial-timeline";
import { SiteHeader } from "@/components/shared/site-header";
import { NavHint } from "@/components/timeline/nav-hint";
import type { TimelineEvent } from "@/lib/timeline/types";

interface TimelineViewProps {
  data: TimelineEvent[];
  repoName?: string;
  timelineId?: string;
}

export function TimelineView({ data, repoName, timelineId }: TimelineViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <SiteHeader repoName={repoName} timelineId={timelineId} hideOnScroll />
      </motion.div>

      <RadialTimeline data={data} />
      <NavHint />
    </motion.div>
  );
}
