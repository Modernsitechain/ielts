import { paragraphBlockId } from "@/core/models/annotation";
import type { Section } from "@/core/models/test";

import { HighlightableText } from "../annotations/highlightable-text";

export function Passage({ section }: { section: Section }) {
  return (
    <article className="mx-auto max-w-prose space-y-5 text-[15px] leading-7 text-slate-800">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">{section.title}</h2>
      {(section.paragraphs ?? []).map((paragraph, index) => (
        <p key={index} className="flex gap-3">
          {paragraph.label && (
            <span className="w-4 shrink-0 font-semibold text-slate-900">{paragraph.label}</span>
          )}
          <HighlightableText
            blockId={paragraphBlockId(section.id, index)}
            text={paragraph.text}
            className="whitespace-pre-line"
          />
        </p>
      ))}
    </article>
  );
}
