"use client";

import * as React from "react";
import {
  MotionValue,
  ValueAnimationTransition,
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useScroll, useWheel } from "@use-gesture/react";
import { Line } from "./line";
import { Sheet } from "./sheet";
import { clamp } from "@/lib/utils/clamp";
import { areIntersecting } from "@/lib/utils/are-intersecting";
import { useShortcuts } from "@/lib/utils/use-shortcuts";
import { useIsHydrated } from "@/lib/utils/use-is-hydrated";
import { useEvent } from "@/lib/utils/use-event";
import { useSounds } from "@/components/shared/sound-provider";
import type { TimelineEvent, Line as LineType, Lines } from "@/lib/timeline/types";

export const SCALE_ZOOM = 6;
export const SCALE_DEFAULT = 1;
export const LINE_COUNT = 180;
export const SCALE_ZOOM_FACTOR = 0.02;
export const SCROLL_SNAP = 250;

////////////////////////////////////////////////////////////////////////////////

interface Constants {
  LINE_WIDTH_SMALL: number;
  LINE_WIDTH_MEDIUM: number;
  LINE_WIDTH_LARGE: number;
  LABEL_FONT_SIZE: number;
  LABEL_MARGIN: number;
  RADIUS: number;
  SIZE: number;
}

export interface TimelineContext extends Constants {
  zoom: boolean;
  rotate: MotionValue<number>;
  rotateToIndex: (index: number) => void;
  setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>;
  hoveredIndex: number | null;
  activeIndex: number | null;
}

const TimelineCtx = React.createContext({} as TimelineContext);
export const useTimeline = () => React.useContext(TimelineCtx);

////////////////////////////////////////////////////////////////////////////////

export const transition: ValueAnimationTransition<number> = {
  type: "spring",
  stiffness: 100,
  damping: 22,
  mass: 1.3,
};

////////////////////////////////////////////////////////////////////////////////

export default function RadialTimeline({ data }: { data: TimelineEvent[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isHydrated = useIsHydrated();
  const scrollY = useMotionValue(0);
  const sheetRef = React.useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = React.useState(false);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const activeNode = React.useRef<HTMLElement>(null);

  const intersectingAtY = useMotionValue(0);
  const rotate = useSpring(0, { stiffness: 150, damping: 42, mass: 1.1 });
  const scale = useSpring(1, { stiffness: 300, damping: 50 });

  const [lines, constants] = useLines(data);
  const { playSwoosh, playSnap, playStep } = useSounds();
  const prevZoomRef = React.useRef(false);

  useShortcuts({
    Escape: () => {
      if (!zoom) rotate.set(0);
      setZoom(false);
      playSwoosh("down");
      activeNode.current?.blur();
      animate(scrollY, 0, transition);
      scale.set(SCALE_DEFAULT);
      setActiveIndex(null);
    },
    ArrowLeft: () => {
      playStep();
      arrow(-1)();
    },
    ArrowRight: () => {
      playStep();
      arrow(1)();
    },
  });

  const context: TimelineContext = {
    ...constants,
    rotateToIndex,
    setHoveredIndex,
    hoveredIndex,
    activeIndex,
    zoom,
    rotate,
  };

  function arrow(dir: 1 | -1) {
    return () => {
      if (activeIndex !== null) {
        const newIndex = activeIndex + dir;
        if (newIndex >= 0 && newIndex < data.length) {
          rotateToIndex(newIndex);
        }
      }
    };
  }

  React.useEffect(() => {
    function wheel(e: WheelEvent) {
      if (Math.abs(e.deltaX) > 0) {
        e.preventDefault();
      }
    }

    window.addEventListener("wheel", wheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", wheel);
    };
  }, []);

  useWheel(
    ({ delta: [dx, dy], last }) => {
      if (Math.abs(dy) > 0) return;
      if (!zoom) return;
      const newRotate = rotate.get() + dx * -1 * 0.5;
      rotate.set(newRotate);
      const newIndex = getIndexForRotate(newRotate, data);
      if (last && newIndex !== activeIndex) {
        if (newIndex !== null) rotateToIndex(newIndex);
      }
    },
    {
      target: typeof window !== "undefined" ? window : undefined,
    }
  );

  useScroll(
    ({ delta: [_, dy], offset: [__, oy] }) => {
      scrollY.stop();
      scrollY.set(-oy);

      if (sheetRef.current && activeNode.current) {
        const intersecting = areIntersecting(
          sheetRef.current,
          activeNode.current
        );
        if (intersecting && intersectingAtY.get() === 0) {
          intersectingAtY.set(oy);
        }
      }

      if (oy <= 0) {
        if (prevZoomRef.current) {
          playSwoosh("down");
          prevZoomRef.current = false;
        }
        scale.set(SCALE_DEFAULT);
        setZoom(false);
        intersectingAtY.set(0);
        setActiveIndex(null);
        setHoveredIndex(null);
        return;
      }

      if (oy >= SCROLL_SNAP) {
        if (!prevZoomRef.current) {
          playSnap();
          playSwoosh("up");
          prevZoomRef.current = true;
        }
        scale.set(SCALE_ZOOM);
        if (activeIndex === null) {
          const index = getIndexForRotate(rotate.get(), data);
          if (index !== null) rotateToIndex(index);
        }
        setZoom(true);
        return;
      }

      let newScale = scale.get() + dy * SCALE_ZOOM_FACTOR;
      newScale = clamp(newScale, [1, SCALE_ZOOM]);
      scale.set(newScale);
    },
    {
      target: typeof window !== "undefined" ? window : undefined,
    }
  );

  React.useEffect(() => {
    window.history.scrollRestoration = "manual";
    document.documentElement.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const activeElement = document.querySelector("[data-active=true]");
    if (activeElement) {
      activeNode.current = activeElement as HTMLElement;
    }
  }, [activeIndex]);

  useEvent("resize", () => {
    intersectingAtY.set(0);
  });

  function rotateToIndex(targetIndex: number | null) {
    if (targetIndex === null) return;
    setZoom(true);
    setActiveIndex(targetIndex);

    if (zoom) {
      document.documentElement.scrollTo({
        top: SCROLL_SNAP,
        left: 0,
        behavior: "smooth",
      });
    } else {
      document.documentElement.scrollTop = SCROLL_SNAP;
    }

    const newRotate = getRotateForIndex(targetIndex, rotate.get(), data);

    if (newRotate === rotate.get()) {
      return;
    }

    rotate.set(newRotate);
  }

  return (
    <main className="w-full h-full overflow-hidden">
      <TimelineCtx.Provider value={context}>
        <div className="fixed translate-center">
          <motion.div
            className="absolute origin-[50%_7vh] translate-center [--highlight-color:var(--color-orange)]"
            style={{
              width: constants.SIZE,
              height: constants.SIZE,
              scale,
              filter: useTransform(scrollY, (y) => {
                if (intersectingAtY.get() === 0) return "blur(0px)";
                let offsetY = Math.abs(y) - intersectingAtY.get();
                const blur = clamp(offsetY * 0.005, [0, 4]);
                return `blur(${blur}px)`;
              }),
            }}
          >
            {isHydrated && (
              <motion.div
                ref={ref}
                className="w-full h-full"
                style={{ rotate }}
                transition={transition}
              >
                {lines.map((line, index) => {
                  return <Line key={index} {...line} data={data} />;
                })}
              </motion.div>
            )}
          </motion.div>
        </div>
        <Sheet ref={sheetRef} data={data} />
      </TimelineCtx.Provider>
    </main>
  );
}

////////////////////////////////////////////////////////////////////////////////

export function getLines(
  rootScale: number,
  data: TimelineEvent[]
): [Lines, Constants] {
  const LINE_WIDTH_SMALL = 40 * rootScale;
  const LINE_WIDTH_MEDIUM = 45 * rootScale;
  const LINE_WIDTH_LARGE = 72 * rootScale;
  const LABEL_FONT_SIZE = 16 * rootScale;
  const LABEL_MARGIN = 80 * rootScale;
  const ANGLE_INCREMENT = 360 / LINE_COUNT;
  const RADIUS = 280 * rootScale;
  const SIZE = RADIUS * 2 + LINE_WIDTH_LARGE * 2;

  const lines: Lines = Array.from({ length: LINE_COUNT }, (_, index) => {
    const rotation = (index - LINE_COUNT / 4) * ANGLE_INCREMENT;
    const angleRad = (rotation * Math.PI) / 180;
    const offsetX = RADIUS * Math.cos(angleRad);
    const offsetY = RADIUS * Math.sin(angleRad);

    const item = data.find((i) => i.degree === index);
    const dataIndex = item ? data.indexOf(item) : null;

    return {
      rotation,
      offsetX,
      offsetY,
      dataIndex,
      variant: item?.variant,
    };
  });

  return [
    lines,
    {
      LINE_WIDTH_SMALL,
      LINE_WIDTH_MEDIUM,
      LINE_WIDTH_LARGE,
      LABEL_FONT_SIZE,
      LABEL_MARGIN,
      RADIUS,
      SIZE,
    },
  ];
}

export function useLines(data: TimelineEvent[]): [Lines, Constants] {
  const [rootScale, setRootScale] = React.useState(1);

  useEvent("resize", () => {
    const widthScale = window.innerWidth / 960;
    const heightScale = window.innerHeight / 640;
    const newScale = clamp(Math.min(widthScale, heightScale), [0.4, 1]);
    setRootScale(newScale);
  });

  const [lines, constants] = React.useMemo(
    () => getLines(rootScale, data),
    [rootScale, data]
  );

  return [lines, constants];
}

////////////////////////////////////////////////////////////////////////////////

export function getRotateForIndex(
  index: number,
  rotate: number,
  data: TimelineEvent[]
) {
  const { degree } = data[index];

  if (degree === null || degree === undefined) {
    return rotate;
  }

  const v1 = degree * 2 * -1;
  const v2 = (degree - LINE_COUNT) * 2 * -1;

  const delta1 = rotate - v1;
  const delta2 = rotate - v2;

  if (Math.abs(delta1) < Math.abs(delta2)) {
    return rotate - delta1;
  } else {
    return rotate - delta2;
  }
}

export function getIndexForRotate(
  rotate: number,
  data: TimelineEvent[]
): number | null {
  const sortedByDelta = data
    .map((i) => {
      const v1 = i.degree * 2 * -1;
      const v2 = (i.degree - LINE_COUNT) * 2 * -1;

      const delta1 = v1 - rotate;
      const delta2 = v2 - rotate;

      return {
        ...i,
        delta: Math.abs(delta1) < Math.abs(delta2) ? delta1 : delta2,
      };
    })
    .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta));

  const closest = sortedByDelta[0];

  if (!closest) {
    return null;
  }

  return data.findIndex((i) => i.degree === closest.degree);
}
