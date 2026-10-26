"use client";

import { useSyncExternalStore } from "react";

// Display settings for the exam (IELTS on computer offers text size and
// colour options). Kept per browser in localStorage: they are a comfort
// setting, not part of the attempt. The page renders with the defaults first
// and switches once the saved value is read, so the server and client agree.

export const TEXT_SIZES = ["standard", "large", "extra-large"] as const;
export const CONTRASTS = ["standard", "white-on-black", "yellow-on-black"] as const;

export type ExamSettings = {
  textSize: (typeof TEXT_SIZES)[number];
  contrast: (typeof CONTRASTS)[number];
};

export const DEFAULT_SETTINGS: ExamSettings = { textSize: "standard", contrast: "standard" };

/** CSS zoom of the passage and questions per text size. */
export const TEXT_SIZE_ZOOM: Record<ExamSettings["textSize"], number> = {
  standard: 1,
  large: 1.15,
  "extra-large": 1.3,
};

const STORAGE_KEY = "ielts-mock:exam-settings";
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedSettings = DEFAULT_SETTINGS;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage blocked (e.g. private mode)
  }
}

function parse(raw: string | null): ExamSettings {
  try {
    const value = JSON.parse(raw ?? "{}") as Partial<ExamSettings>;
    const textSize = TEXT_SIZES.find((size) => size === value.textSize) ?? "standard";
    const contrast = CONTRASTS.find((option) => option === value.contrast) ?? "standard";
    return { textSize, contrast };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Same object while the stored value doesn't change (required by useSyncExternalStore). */
function getSnapshot(): ExamSettings {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSettings = parse(raw);
  }
  return cachedSettings;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Other tabs changing the settings.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function saveSettings(settings: ExamSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Not saved, but still applied below for this page.
    cachedRaw = JSON.stringify(settings);
    cachedSettings = settings;
  }
  listeners.forEach((listener) => listener());
}

export function useExamSettings(): [ExamSettings, (settings: ExamSettings) => void] {
  const settings = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_SETTINGS);
  return [settings, saveSettings];
}
