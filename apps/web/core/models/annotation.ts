// Highlights and notes, shared with apps/api (@ielts-mock/question-schema):
// the type plus the pure functions that merge, trim and split ranges.
export type { Annotation, TextRange, TextSegment } from "@ielts-mock/question-schema";
export {
  addHighlight,
  isHighlighted,
  paragraphBlockId,
  promptBlockId,
  promptParts,
  removeAnnotation,
  removeHighlights,
  segmentText,
  setNote,
  textBlocks,
} from "@ielts-mock/question-schema";
