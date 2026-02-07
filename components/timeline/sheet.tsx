"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useTimeline } from "./radial-timeline";
import { EventDetail } from "./event-detail";
import type { TimelineEvent } from "@/lib/timeline/types";

export function Sheet({
  ref,
  data,
}: {
  ref: React.Ref<HTMLDivElement>;
  data: TimelineEvent[];
}) {
  const { zoom, activeIndex } = useTimeline();
  const [item, setItem] = React.useState<TimelineEvent | null>(null);

  React.useEffect(() => {
    if (activeIndex === null) return;
    const activeItem = data[activeIndex];
    if (activeItem) {
      setItem(activeItem);
    }
  }, [activeIndex, data]);

  return (
    <motion.div
      ref={ref}
      className="relative px-8 max-w-[700px] mx-auto mt-[50vh] top-0 flex pb-[100px] data-[active=false]:pointer-events-none"
      initial={false}
      style={{
        pointerEvents: zoom ? "auto" : "none",
      }}
      animate={{
        filter: zoom ? "blur(0px)" : "blur(20px)",
        opacity: zoom ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: zoom ? 150 : 300,
        damping: 25,
        delay: zoom ? 0.4 : 0,
      }}
      onAnimationComplete={() => {
        if (!zoom) {
          document.documentElement.scrollTop = 0;
        }
      }}
    >
      {item && <EventDetail event={item} />}
    </motion.div>
  );
}
