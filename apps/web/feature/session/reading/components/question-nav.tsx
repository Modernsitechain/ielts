"use client";

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

/** Bar navigasi di bawah layar, meniru IELTS on computer. */
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
    <nav className="flex flex-wrap items-center gap-4 border-t border-slate-300 bg-slate-100 px-4 py-2">
      <button
        type="button"
        onClick={onToggleFlag}
        aria-pressed={isFlagged}
        className={`rounded border px-3 py-1 text-sm ${
          isFlagged
            ? "border-amber-500 bg-amber-100 text-amber-900"
            : "border-slate-400 bg-white"
        }`}
      >
        {isFlagged ? "⚑ Flagged" : "⚐ Flag for review"}
      </button>

      <div className="flex flex-1 flex-wrap items-center gap-4">
        {parts.map((part) => (
          <div key={part.title} className="flex items-center gap-1">
            <span className="mr-1 text-sm font-semibold">{part.title}</span>
            {part.numbers.map((number) => {
              const isCurrent = number === currentNumber;
              const isAnswered = answeredNumbers.has(number);
              return (
                <button
                  key={number}
                  type="button"
                  onClick={() => onSelect(number)}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Question ${number}${isAnswered ? ", answered" : ""}${
                    flaggedNumbers.has(number) ? ", flagged" : ""
                  }`}
                  className={`relative h-8 w-8 rounded text-sm ${
                    isAnswered
                      ? "bg-slate-700 text-white"
                      : "border border-slate-400 bg-white"
                  } ${isCurrent ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
                >
                  {number}
                  {flaggedNumbers.has(number) && (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
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
          className="h-8 w-8 rounded border border-slate-400 bg-white"
        >
          ←
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next question"
          className="h-8 w-8 rounded border border-slate-400 bg-white"
        >
          →
        </button>
      </div>
    </nav>
  );
}
