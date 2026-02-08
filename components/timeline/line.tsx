"use client";

import { motion } from "motion/react";
import styles from "./radial-timeline.module.css";
import { Meta } from "./meta";
import { useTimeline, transition } from "./radial-timeline";
import { useSounds } from "@/components/shared/sound-provider";
import type { Line as LineType, TimelineEvent } from "@/lib/timeline/types";

export function Line({
  dataIndex,
  variant,
  rotation,
  offsetX,
  offsetY,
  data,
}: LineType & { data: TimelineEvent[] }) {
  const {
    zoom,
    hoveredIndex,
    activeIndex,
    rotateToIndex,
    setHoveredIndex,
    LINE_WIDTH_LARGE,
    LINE_WIDTH_SMALL,
    LINE_WIDTH_MEDIUM,
    LABEL_FONT_SIZE,
    LABEL_MARGIN,
    RADIUS,
  } = useTimeline();
  const { playTickDebounced, playPop } = useSounds();

  const isInteractive = dataIndex !== null;
  const currentItem = isInteractive ? data[dataIndex] : null;
  const hoveredItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  const hovered = dataIndex === hoveredIndex && dataIndex !== null;
  const active = activeIndex === dataIndex && dataIndex !== null;

  let width = LINE_WIDTH_SMALL;
  if (variant === "medium") width = LINE_WIDTH_MEDIUM;
  if (variant === "large" || hovered || active) width = LINE_WIDTH_LARGE;

  const props = {
    ...(isInteractive && {
      onClick: () => rotateToIndex(dataIndex),
      onMouseEnter: () => {
        setHoveredIndex(dataIndex);
        playPop();
      },
      onMouseLeave: () => setHoveredIndex(null),
    }),
    ...(!isInteractive && {
      onMouseEnter: () => playTickDebounced(),
    }),
  };

  const Root = isInteractive ? motion.button : motion.div;

  return (
    <Root
      {...props}
      className={styles.line}
      data-variant={variant}
      data-active={active}
      data-hovered={hovered || active}
      {...(isInteractive && currentItem && {
        "aria-label": `${currentItem.name}, ${currentItem.year}`,
        "aria-current": active ? ("true" as const) : undefined,
      })}
      style={{
        rotate: rotation,
        x: RADIUS + offsetX + LINE_WIDTH_LARGE,
        y: RADIUS + offsetY + LINE_WIDTH_LARGE,
        width,
      }}
      initial={false}
      animate={{
        width,
        transition: {
          ...transition,
          width: {
            type: "spring",
            stiffness: 250,
            damping: 25,
          },
        },
        scale: zoom ? 0.2 : 1,
      }}
    >
      {/* Forces Safari to render with GPU */}
      <div aria-hidden style={{ transform: "translateZ(0)" }} />
      {currentItem?.name && currentItem?.year && (
        <Meta
          currentItem={currentItem}
          hoveredItem={hoveredItem}
          hovered={hovered}
          zoom={zoom}
          rotation={rotation}
          style={{
            fontSize: LABEL_FONT_SIZE,
            x: LABEL_MARGIN,
          }}
        />
      )}
    </Root>
  );
}
