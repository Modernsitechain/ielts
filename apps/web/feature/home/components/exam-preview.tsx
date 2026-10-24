import { Clock, Flag, Sparkles } from "lucide-react";

const PASSAGE_LINES = ["w-11/12", "w-full", "w-10/12", "w-full", "w-9/12"];
const NAV_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const ANSWERED = new Set([1, 2, 3, 5]);

/** Illustrative mock-up of the exam screen for the hero. Purely decorative. */
export function ExamPreview() {
  return (
    <div className="relative" aria-hidden>
      <div className="absolute -inset-4 rounded-4xl bg-linear-to-br from-indigo-500/20 via-violet-500/10 to-fuchsia-500/20 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-indigo-500/10">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          </div>
          <span className="text-xs font-medium text-slate-500">Reading · Part 1</span>
          <span className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 font-mono text-xs text-slate-700 ring-1 ring-slate-200">
            <Clock className="h-3 w-3" />
            58:12
          </span>
        </div>

        <div className="grid grid-cols-2 divide-x divide-slate-200">
          <div className="space-y-2.5 p-4">
            <div className="h-3 w-1/2 rounded-sm bg-slate-800" />
            {PASSAGE_LINES.map((width, index) => (
              <div key={index} className={`h-2 rounded-sm bg-slate-200 ${width}`} />
            ))}
            <div className="flex gap-1">
              <div className="h-2 w-3/12 rounded-sm bg-slate-200" />
              <div className="h-2 w-5/12 rounded-sm bg-amber-300" />
              <div className="h-2 w-4/12 rounded-sm bg-slate-200" />
            </div>
            {PASSAGE_LINES.slice(0, 3).map((width, index) => (
              <div key={index} className={`h-2 rounded-sm bg-slate-200 ${width}`} />
            ))}
          </div>

          <div className="space-y-3 p-4">
            <div className="h-2.5 w-2/3 rounded-sm bg-slate-700" />
            {["TRUE", "FALSE", "NOT GIVEN"].map((option) => (
              <div key={option} className="flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full border ${
                    option === "FALSE" ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                  }`}
                />
                <span className="text-[10px] font-medium text-slate-600">{option}</span>
              </div>
            ))}
            <div className="h-2 w-5/6 rounded-sm bg-slate-200" />
            <div className="h-6 w-28 rounded-sm border border-slate-300" />
          </div>
        </div>

        <div className="flex items-center gap-1 border-t border-slate-200 bg-slate-50 px-4 py-2.5">
          <Flag className="mr-1 h-3.5 w-3.5 text-slate-400" />
          {NAV_NUMBERS.map((number) => (
            <span
              key={number}
              className={`flex h-5 w-5 items-center justify-center rounded-sm text-[9px] font-medium ${
                ANSWERED.has(number)
                  ? "bg-slate-800 text-white"
                  : "border border-slate-300 bg-white text-slate-500"
              } ${number === 4 ? "ring-2 ring-indigo-500 ring-offset-1" : ""}`}
            >
              {number}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-8 -left-6 hidden w-64 rounded-xl border border-violet-200 bg-white/95 p-3 shadow-xl shadow-violet-500/10 backdrop-blur-sm sm:block">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-violet-700">
          <Sparkles className="h-3.5 w-3.5" />
          AI explanation
          <span className="ml-auto rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium">
            Soon
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-600">
          Paragraph C says green space &ldquo;barely changed&rdquo;, so the answer
          to Question 3 is <span className="font-semibold text-slate-900">FALSE</span>.
        </p>
      </div>
    </div>
  );
}
