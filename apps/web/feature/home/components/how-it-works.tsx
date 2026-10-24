import { BookOpen, ChartColumn, type LucideIcon, Play } from "lucide-react";

const STEPS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: BookOpen,
    title: "Choose a test",
    description: "Pick an Academic Reading or Listening test. Your first one is free.",
  },
  {
    icon: Play,
    title: "Take it under test conditions",
    description: "Exam mode runs the clock exactly as the real test does.",
  },
  {
    icon: ChartColumn,
    title: "Review your results",
    description: "See your band estimate and every correct answer straight away.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          How it works
        </h2>

        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="relative rounded-2xl bg-white p-6 ring-1 ring-slate-200">
              <span className="absolute top-6 right-6 font-mono text-sm text-slate-300">
                0{index + 1}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
