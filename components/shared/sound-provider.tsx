"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  playTick as rawPlayTick,
  playSwoosh as rawPlaySwoosh,
  playSnap as rawPlaySnap,
  playPop as rawPlayPop,
  playStep as rawPlayStep,
  playTickDebounced as rawPlayTickDebounced,
} from "@/lib/sounds";

interface SoundContextValue {
  muted: boolean;
  toggleMute: () => void;
  playTick: (pitchVariation?: number) => void;
  playPop: () => void;
  playSwoosh: (direction: "up" | "down") => void;
  playSnap: () => void;
  playStep: () => void;
  playTickDebounced: () => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

const STORAGE_KEY = "git-historian-muted";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Hydrate mute state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setMuted(true);
  }, []);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const shouldPlay = !muted && !prefersReducedMotion;

  const playTick = useCallback(
    (pitchVariation?: number) => {
      if (shouldPlay) rawPlayTick(pitchVariation);
    },
    [shouldPlay]
  );

  const playSwoosh = useCallback(
    (direction: "up" | "down") => {
      if (shouldPlay) rawPlaySwoosh(direction);
    },
    [shouldPlay]
  );

  const playSnap = useCallback(() => {
    if (shouldPlay) rawPlaySnap();
  }, [shouldPlay]);

  const playPop = useCallback(() => {
    if (shouldPlay) rawPlayPop();
  }, [shouldPlay]);

  const playStep = useCallback(() => {
    if (shouldPlay) rawPlayStep();
  }, [shouldPlay]);

  const playTickDebounced = useCallback(() => {
    if (shouldPlay) rawPlayTickDebounced();
  }, [shouldPlay]);

  const value = useMemo<SoundContextValue>(
    () => ({
      muted,
      toggleMute,
      playTick,
      playPop,
      playSwoosh,
      playSnap,
      playStep,
      playTickDebounced,
    }),
    [muted, toggleMute, playTick, playPop, playSwoosh, playSnap, playStep, playTickDebounced]
  );

  return <SoundContext value={value}>{children}</SoundContext>;
}

export function useSounds(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error("useSounds must be used within a SoundProvider");
  }
  return ctx;
}
