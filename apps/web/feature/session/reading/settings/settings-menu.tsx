"use client";

import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CONTRASTS, type ExamSettings, TEXT_SIZES } from "./exam-settings";

const TEXT_SIZE_LABEL: Record<ExamSettings["textSize"], string> = {
  standard: "Standard",
  large: "Large",
  "extra-large": "Extra large",
};

const CONTRAST_LABEL: Record<ExamSettings["contrast"], string> = {
  standard: "Black on white",
  "white-on-black": "White on black",
  "yellow-on-black": "Yellow on black",
};

/** Header button with the text size and colour options. */
export function SettingsMenu({
  settings,
  onChange,
}: {
  settings: ExamSettings;
  onChange: (settings: ExamSettings) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const option = (selected: boolean) =>
    `rounded-md px-3 py-1.5 text-left text-sm ring-1 transition ${
      selected ? "bg-slate-900 text-white ring-slate-900" : "text-slate-700 ring-slate-200 hover:bg-slate-100"
    }`;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
      >
        <Settings className="h-4 w-4" aria-hidden />
        Settings
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Display settings"
          className="absolute right-0 z-40 mt-2 w-64 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
        >
          <fieldset className="space-y-2">
            <legend className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Text size</legend>
            <div className="grid gap-1.5">
              {TEXT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  aria-pressed={settings.textSize === size}
                  onClick={() => onChange({ ...settings, textSize: size })}
                  className={option(settings.textSize === size)}
                >
                  {TEXT_SIZE_LABEL[size]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Colours</legend>
            <div className="grid gap-1.5">
              {CONTRASTS.map((contrast) => (
                <button
                  key={contrast}
                  type="button"
                  aria-pressed={settings.contrast === contrast}
                  onClick={() => onChange({ ...settings, contrast })}
                  className={option(settings.contrast === contrast)}
                >
                  {CONTRAST_LABEL[contrast]}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
