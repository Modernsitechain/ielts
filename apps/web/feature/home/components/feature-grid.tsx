import {
  ChartColumn,
  Columns2,
  Headphones,
  Highlighter,
  ListChecks,
  type LucideIcon,
  Timer,
} from "lucide-react";

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Columns2,
    title: "Split-screen reading",
    description:
      "Passage on the left, questions on the right, each scrolling on its own, just like the real test.",
  },
  {
    icon: Highlighter,
    title: "Highlights & notes",
    description:
      "Mark key phrases and jot notes on the passage and the questions as you work.",
  },
  {
    icon: Timer,
    title: "Real timing",
    description:
      "60 minutes for Reading, enforced by the server. When time is up, your answers are submitted.",
  },
  {
    icon: Headphones,
    title: "Listening, played once",
    description:
      "Four parts with reading time before each and a final two-minute check, as on test day.",
  },
  {
    icon: ListChecks,
    title: "Question navigator",
    description:
      "Jump between all 40 questions, see what's answered and flag items to review later.",
  },
  {
    icon: ChartColumn,
    title: "Band score & review",
    description:
      "Instant raw score and band estimate, with the correct answer for every question.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-indigo-600">Built like the real thing</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Practise on the interface you&apos;ll see on test day
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Knowing the content is half the battle. The other half is being
          comfortable with the screen, the tools and the clock.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-5 font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
