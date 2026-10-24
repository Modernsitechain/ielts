import type { Section } from "@/core/models/test";

// Paragraphs are separated by blank lines; labelled ones are written "A  text...".
const LABELLED_PARAGRAPH = /^([A-Z])\s{2,}([\s\S]*)$/;

export function Passage({ section }: { section: Section }) {
  const paragraphs = (section.content ?? "").split(/\n\s*\n/);

  return (
    <article className="mx-auto max-w-prose space-y-5 text-[15px] leading-7 text-slate-800">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">{section.title}</h2>
      {paragraphs.map((paragraph, index) => {
        const match = LABELLED_PARAGRAPH.exec(paragraph.trim());
        return (
          <p key={index} className="flex gap-3">
            {match ? (
              <>
                <span className="w-4 shrink-0 font-semibold text-slate-900">{match[1]}</span>
                <span>{match[2]}</span>
              </>
            ) : (
              paragraph
            )}
          </p>
        );
      })}
    </article>
  );
}
