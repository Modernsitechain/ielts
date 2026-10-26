import { z } from "zod";

import type { Paragraph } from "./authoring.js";

// Highlights and notes a candidate adds while taking a test (IELTS on
// computer lets them mark the passage and the question text).
//
// Text is split into blocks; an annotation is a character range within one
// block. Block ids:
// - `p:<sectionId>:<paragraphIndex>`: a passage paragraph
// - `q:<questionId>:<part>`: a question prompt; completion prompts are cut
//   at the gap (BLANK_PATTERN), so they have part 0 (before) and 1 (after)
// Within a block, annotations never overlap: the functions below keep them
// sorted and merged.

/** A gap in a completion prompt: three or more underscores. */
export const BLANK_PATTERN = /_{3,}/;

export const MAX_ANNOTATIONS = 500;
export const MAX_NOTE_LENGTH = 1000;

export const annotationSchema = z
  .object({
    blockId: z.string().min(1).max(200),
    start: z.number().int().min(0),
    end: z.number().int().min(1),
    /** Null for a plain highlight. */
    note: z.string().trim().max(MAX_NOTE_LENGTH).nullable(),
  })
  .refine((annotation) => annotation.start < annotation.end, {
    message: "start must be before end",
  });

export const saveAnnotationsSchema = z.object({
  annotations: z.array(annotationSchema).max(MAX_ANNOTATIONS),
});

export type Annotation = z.infer<typeof annotationSchema>;

/** A range to annotate, e.g. from the candidate's text selection. */
export type TextRange = Pick<Annotation, "blockId" | "start" | "end">;

export function paragraphBlockId(sectionId: string, index: number): string {
  return `p:${sectionId}:${index}`;
}

export function promptBlockId(questionId: string, part: number): string {
  return `q:${questionId}:${part}`;
}

/** A prompt's text around its gap (one part when it has no gap). */
export function promptParts(prompt: string): string[] {
  return prompt.split(BLANK_PATTERN);
}

type AnnotatableTest = {
  sections: {
    id: string;
    paragraphs: Paragraph[] | null;
    groups: { questions: { id: string; prompt: string }[] }[];
  }[];
};

/** Every block that can be annotated, with its text. */
export function textBlocks(test: AnnotatableTest): Map<string, string> {
  const blocks = new Map<string, string>();
  for (const section of test.sections) {
    (section.paragraphs ?? []).forEach((paragraph, index) => {
      blocks.set(paragraphBlockId(section.id, index), paragraph.text);
    });
    for (const group of section.groups) {
      for (const question of group.questions) {
        promptParts(question.prompt).forEach((text, part) => {
          blocks.set(promptBlockId(question.id, part), text);
        });
      }
    }
  }
  return blocks;
}

function byPosition(a: Annotation, b: Annotation): number {
  return a.blockId.localeCompare(b.blockId) || a.start - b.start;
}

function joinNotes(notes: (string | null)[]): string | null {
  const text = notes.filter((note): note is string => Boolean(note?.trim())).join("\n");
  return text ? text.slice(0, MAX_NOTE_LENGTH) : null;
}

/**
 * Highlights a range. Highlights it overlaps or touches are merged into one,
 * keeping their notes; `note` (if given) is added to them.
 */
export function addHighlight(
  annotations: Annotation[],
  range: TextRange,
  note: string | null = null,
): Annotation[] {
  const touching = (a: Annotation) =>
    a.blockId === range.blockId && a.start <= range.end && a.end >= range.start;
  const merged = annotations.filter(touching);
  const rest = annotations.filter((a) => !touching(a));
  const combined: Annotation = {
    blockId: range.blockId,
    start: Math.min(range.start, ...merged.map((a) => a.start)),
    end: Math.max(range.end, ...merged.map((a) => a.end)),
    note: joinNotes([...merged.map((a) => a.note), note]),
  };
  return [...rest, combined].sort(byPosition);
}

/**
 * Removes every highlight the range touches, whole (with its note), even if
 * the range covers only part of it.
 */
export function removeHighlights(annotations: Annotation[], range: TextRange): Annotation[] {
  return annotations.filter(
    (a) => !(a.blockId === range.blockId && a.start < range.end && a.end > range.start),
  );
}

/** Whether any highlight overlaps the range. */
export function isHighlighted(annotations: Annotation[], range: TextRange): boolean {
  return annotations.some(
    (a) => a.blockId === range.blockId && a.start < range.end && a.end > range.start,
  );
}

/** Sets (or, with an empty text, removes) the note of the annotation at `at`. */
export function setNote(annotations: Annotation[], at: TextRange, note: string): Annotation[] {
  const text = note.trim().slice(0, MAX_NOTE_LENGTH) || null;
  return annotations.map((a) =>
    a.blockId === at.blockId && a.start === at.start ? { ...a, note: text } : a,
  );
}

/** Removes the annotation at `at` entirely. */
export function removeAnnotation(annotations: Annotation[], at: TextRange): Annotation[] {
  return annotations.filter((a) => !(a.blockId === at.blockId && a.start === at.start));
}

export type TextSegment = { text: string; start: number; annotation: Annotation | null };

/**
 * Cuts a block's text into plain and annotated pieces, for rendering.
 * Ranges outside the text are clipped; overlapping ones are skipped.
 */
export function segmentText(text: string, blockAnnotations: Annotation[]): TextSegment[] {
  const segments: TextSegment[] = [];
  let position = 0;
  for (const annotation of [...blockAnnotations].sort((a, b) => a.start - b.start)) {
    const start = Math.max(annotation.start, position);
    const end = Math.min(annotation.end, text.length);
    if (start >= end) continue;
    if (start > position) segments.push({ text: text.slice(position, start), start: position, annotation: null });
    segments.push({ text: text.slice(start, end), start, annotation });
    position = end;
  }
  if (position < text.length) segments.push({ text: text.slice(position), start: position, annotation: null });
  return segments;
}

/**
 * Problems with a list of annotations for a test: unknown blocks, ranges past
 * the end of the text, or overlapping ranges. Empty when valid.
 */
export function checkAnnotations(annotations: Annotation[], blocks: Map<string, string>): string[] {
  const problems: string[] = [];
  const sorted = [...annotations].sort(byPosition);
  sorted.forEach((annotation, index) => {
    const text = blocks.get(annotation.blockId);
    if (text === undefined) {
      problems.push(`Unknown text block ${annotation.blockId}`);
    } else if (annotation.end > text.length) {
      problems.push(`Range ${annotation.start}–${annotation.end} is outside ${annotation.blockId}`);
    }
    const previous = sorted[index - 1];
    if (previous?.blockId === annotation.blockId && previous.end > annotation.start) {
      problems.push(`Overlapping annotations in ${annotation.blockId}`);
    }
  });
  return problems;
}
