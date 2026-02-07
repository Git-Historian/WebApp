import React from "react";
import { useInView } from "motion/react";

export function useInViewLoop(
  duration: number = 1500,
  play = true,
  callback?: () => void
): [boolean, React.RefObject<HTMLDivElement | null>] {
  const [active, setActive] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref);

  React.useEffect(() => {
    if (!isInView || !play) return;
    const interval = setInterval(() => {
      setActive((a) => !a);
      callback?.();
    }, duration);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, isInView]);

  return [active, ref];
}
