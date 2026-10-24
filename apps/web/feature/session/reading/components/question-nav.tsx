"use client";

import { ChevronLeft, ChevronRight, Flag } from "lucide-react";

export type NavPart = {
  title: string;
  numbers: number[];
};

type Props = {
  parts: NavPart[];
  currentNumber: number;
  answeredNumbers: Set<number>;
  flaggedNumbers: Set<number>;
  onSelect: (number: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleFlag: () => void;
};

/** Navigation bar at the bottom of the screen, modelled on IELTS on computer. */
export function QuestionNav({
  parts,
  currentNumber,
  answeredNumbers,
  flaggedNumbers,
  onSelect,
  onPrevious,
  onNext,
  onToggleFlag,
}: Props) {
  const isFlagged = flaggedNumbers.has(currentNumber);

  return (
    <nav className="flex flex-wrap items-center gap-4 border-t border-slate-200 bg-white px-4 py-3">
      <button
        type="button"
        onClick={onToggleFlag}
        aria-pressed={isFlagged}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition ${
          isFlagged
            ? "bg-amber-50 text-amber-800 ring-amber-300"
            : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50"
        }`}
      >
        <Flag className={`h-4 w-4 ${isFlagged ? "fill-amber-400 text-amber-600" : ""}`} aria-hidden />
        {isFlagged ? "Flagged" : "Flag for review"}
      </button>

      <div className="flex flex-1 flex-wrap items-center gap-5">
        {parts.map((part) => (
          <div key={part.title} className="flex items-center gap-1.5">
            <span className="mr-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {part.title}
            </span>
            {part.numbers.map((number) => {
              const isCurrent = number === currentNumber;
              const isAnswered = answeredNumbers.has(number);
              const isNumberFlagged = flaggedNumbers.has(number);
              return (
                <button
                  key={number}
                  type="button"
                  onClick={() => onSelect(number)}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Question ${number}${isAnswered ? ", answered" : ""}${
                    isNumberFlagged ? ", flagged" : ""
                  }`}
                  className={`relative h-8 w-8 rounded-lg text-sm font-medium transition ${
                    isAnswered
                      ? "bg-slate-900 text-white hover:bg-slate-700"
                      : "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
                  } ${isCurrent ? "outline-2 outline-offset-2 outline-indigo-500" : ""}`}
                >
                  {number}
                  {isNumberFlagged && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrevious}
          aria-label="Previous question"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next question"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </nav>
  );
}
