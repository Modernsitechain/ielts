import type { Section } from "@/core/models/test";

// Paragraf dipisah baris kosong; paragraf berlabel ditulis "A  teks...".
const LABELLED_PARAGRAPH = /^([A-Z])\s{2,}([\s\S]*)$/;

export function Passage({ section }: { section: Section }) {
  const paragraphs = (section.content ?? "").split(/\n\s*\n/);

  return (
    <article className="space-y-4 leading-relaxed">
      <h2 className="text-lg font-bold">{section.title}</h2>
      {paragraphs.map((paragraph, index) => {
        const match = LABELLED_PARAGRAPH.exec(paragraph.trim());
        return (
          <p key={index}>
            {match ? (
              <>
                <span className="mr-2 font-bold">{match[1]}</span>
                {match[2]}
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
