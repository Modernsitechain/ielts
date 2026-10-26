"use client";

import { StickyNote } from "lucide-react";

import { segmentText } from "@/core/models/annotation";

import { useAnnotations } from "./annotations-context";

/**
 * Text the candidate can highlight and annotate. The element carries
 * data-block-id so selections map to character offsets (selection.ts); it
 * must contain only this text, so the offsets match the stored ranges. Each
 * highlight carries data-start, so a right-click on it finds the annotation.
 */
export function HighlightableText({
  blockId,
  text,
  className,
}: {
  blockId: string;
  text: string;
  className?: string;
}) {
  const annotations = useAnnotations();
  const own = annotations.filter((annotation) => annotation.blockId === blockId);

  return (
    <span data-block-id={blockId} className={className}>
      {segmentText(text, own).map(({ text: piece, start, annotation }) =>
        annotation ? (
          <mark
            key={start}
            data-start={annotation.start}
            title={annotation.note ?? "Right-click to add a note or remove the highlight"}
            className={`rounded-xs bg-yellow-200 text-inherit ${
              annotation.note ? "underline decoration-amber-500 decoration-2 underline-offset-2" : ""
            }`}
          >
            {piece}
            {annotation.note && start + piece.length === Math.min(annotation.end, text.length) && (
              <StickyNote className="ml-0.5 inline h-3 w-3 align-baseline text-amber-600" aria-label="Has a note" />
            )}
          </mark>
        ) : (
          piece
        ),
      )}
    </span>
  );
}
