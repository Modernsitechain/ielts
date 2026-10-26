"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

const SECTIONS: { title: string; points: string[] }[] = [
  {
    title: "Moving around",
    points: [
      "Use the numbers at the bottom of the screen to go to any question, or the arrows to move one at a time.",
      "Answered questions are marked in the bar. You can change or clear an answer at any time before you submit.",
      "Drag the line between the passage and the questions to make either side wider.",
    ],
  },
  {
    title: "Highlights and notes",
    points: [
      "Select text in the passage or a question, then right-click it and choose Highlight or Add note.",
      "Right-click a highlight to add or edit its note, or to remove it. Selecting part of a highlight and choosing Remove highlight removes all of it.",
      "Open Notes in the top bar to see every note and jump back to it.",
    ],
  },
  {
    title: "Review and settings",
    points: [
      "Flag a question to come back to it later; flagged questions are marked in the bar.",
      "Settings changes the text size and the colours of the screen.",
      "Your answers, highlights and flags are saved automatically as you work.",
    ],
  },
  {
    title: "Time",
    points: [
      "The timer shows the time left. You will see a reminder when 10 and 5 minutes are left.",
      "When time runs out, your answers are submitted automatically.",
    ],
  },
];

/** How the exam screen works, opened from the Help button. */
export function HelpDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="help-title" className="text-lg font-semibold">
            How this test works
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close help"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="mt-4 space-y-5">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h3 className="text-sm font-semibold">{section.title}</h3>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
