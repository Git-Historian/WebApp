"use client";

import { motion, MotionStyle, useTransform } from "motion/react";
import { useTimeline, transition } from "./radial-timeline";
import type { TimelineEvent } from "@/lib/timeline/types";

export function Meta({
  currentItem,
  hoveredItem,
  hovered,
  zoom,
  style,
  rotation,
}: {
  currentItem: TimelineEvent;
  hoveredItem: TimelineEvent | null;
  hovered?: boolean;
  zoom?: boolean;
  style: MotionStyle;
  rotation: number;
}) {
  const { rotate } = useTimeline();
  const reverseRotate = useTransform(rotate, (r) => -r - rotation);
  const isPartiallyVisible = hoveredItem && hoveredItem.variant === "medium";

  let opacity = 0;

  if (currentItem.variant === "large") {
    opacity = isPartiallyVisible ? 0.2 : 1;
  }

  if (hovered || zoom) {
    opacity = 1;
  }

  return (
    <motion.div
      className="flex flex-col items-center whitespace-nowrap translate-y-[-50%]"
      data-slot="meta"
      style={{ ...style, rotate: reverseRotate }}
      initial={{ opacity }}
      animate={{ opacity }}
      transition={{
        opacity: { delay: zoom && !isPartiallyVisible ? 0.4 : 0 },
        ...transition,
      }}
    >
      <i data-slot="label">{currentItem.name}</i>
      <i data-slot="year">{currentItem.year}</i>
    </motion.div>
  );
}
