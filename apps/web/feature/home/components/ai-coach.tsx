import { Brain, type LucideIcon, Sparkles, Target, WandSparkles } from "lucide-react";

const POINTS: { icon: LucideIcon; text: string }[] = [
  {
    icon: WandSparkles,
    text: "Explains why each answer is right, pointing to the exact sentence in the passage or transcript.",
  },
  {
    icon: Brain,
    text: "Spots patterns in your mistakes across tests, such as NOT GIVEN traps or word limits.",
  },
  {
    icon: Target,
    text: "Suggests which question types to practise next.",
  },
];

/** Teaser for the post-MVP AI features (roadmap phase 7). Not built yet. */
export function AiCoach() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-16 text-white sm:px-12">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-violet-600/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl" />

        <div className="relative grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-violet-200 ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Coming soon
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your{" "}
              <span className="bg-linear-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                AI study coach
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              Getting a question wrong is only useful if you understand why.
            </p>

            <ul className="mt-8 space-y-4">
              {POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-violet-200">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="pt-1 text-sm leading-relaxed text-slate-300">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-sm" aria-hidden>
            <p className="text-xs text-slate-400">Question 4 · True / False / Not Given</p>
            <p className="mt-2 text-sm text-slate-200">
              The researchers were certain that competition between bees was the
              only cause of lower honey yields.
            </p>
            <div className="mt-4 flex gap-2 text-xs">
              <span className="rounded-md bg-rose-500/15 px-2 py-1 text-rose-300">Your answer: NOT GIVEN</span>
              <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-emerald-300">Correct: FALSE</span>
            </div>
            <div className="mt-4 rounded-xl bg-linear-to-br from-indigo-500/20 via-violet-500/15 to-fuchsia-500/20 p-4 ring-1 ring-violet-400/20">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-violet-200">
                <Sparkles className="h-3.5 w-3.5" />
                Why it&apos;s FALSE
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                Paragraph C says the researchers <em>&ldquo;cautioned&rdquo;</em> that
                weather and disease could also explain the decline. They were not
                certain, which contradicts the statement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
