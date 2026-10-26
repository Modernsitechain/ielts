import { describe, expect, it } from "vitest";

import {
  addHighlight,
  type Annotation,
  checkAnnotations,
  isHighlighted,
  removeAnnotation,
  removeHighlights,
  segmentText,
  setNote,
  textBlocks,
} from "./annotation.js";

const B = "p:s1:0";
const hl = (start: number, end: number, note: string | null = null, blockId = B): Annotation => ({
  blockId,
  start,
  end,
  note,
});

describe("addHighlight", () => {
  it("adds a separate highlight", () => {
    expect(addHighlight([hl(0, 3)], { blockId: B, start: 5, end: 8 })).toEqual([hl(0, 3), hl(5, 8)]);
  });

  it("merges overlapping and touching highlights, keeping notes", () => {
    const result = addHighlight([hl(0, 3, "first"), hl(6, 9, "second")], { blockId: B, start: 3, end: 7 }, "new");
    expect(result).toEqual([hl(0, 9, "first\nsecond\nnew")]);
  });

  it("leaves other blocks alone", () => {
    const other = hl(0, 5, null, "q:x:0");
    expect(addHighlight([other], { blockId: B, start: 0, end: 5 })).toEqual([hl(0, 5), other]);
  });
});

describe("removeHighlights", () => {
  it("removes whole highlights the range touches, notes included", () => {
    // Highlight a–g, select b–e: all of a–g goes.
    expect(removeHighlights([hl(0, 7, "note")], { blockId: B, start: 1, end: 5 })).toEqual([]);
  });

  it("keeps highlights the range doesn't touch", () => {
    expect(removeHighlights([hl(0, 3), hl(5, 8), hl(0, 3, null, "q:x:0")], { blockId: B, start: 4, end: 6 })).toEqual([
      hl(0, 3),
      hl(0, 3, null, "q:x:0"),
    ]);
  });
});

describe("notes and lookups", () => {
  it("sets, clears and removes", () => {
    const at = { blockId: B, start: 2, end: 5 };
    expect(setNote([hl(2, 5)], at, "  why ")).toEqual([hl(2, 5, "why")]);
    expect(setNote([hl(2, 5, "why")], at, " ")).toEqual([hl(2, 5)]);
    expect(removeAnnotation([hl(2, 5), hl(7, 8)], at)).toEqual([hl(7, 8)]);
    expect(isHighlighted([hl(2, 5)], { blockId: B, start: 4, end: 9 })).toBe(true);
    expect(isHighlighted([hl(2, 5)], { blockId: B, start: 5, end: 9 })).toBe(false);
  });
});

describe("segmentText", () => {
  it("cuts text into plain and highlighted pieces", () => {
    expect(segmentText("Bees live in hives.", [hl(5, 9)]).map((s) => [s.text, s.annotation !== null])).toEqual([
      ["Bees ", false],
      ["live", true],
      [" in hives.", false],
    ]);
  });

  it("clips ranges past the end of the text", () => {
    expect(segmentText("Bees", [hl(2, 99)]).map((s) => s.text)).toEqual(["Be", "es"]);
  });
});

describe("textBlocks and checkAnnotations", () => {
  const blocks = textBlocks({
    sections: [
      {
        id: "s1",
        paragraphs: [{ label: "A", text: "Bees live in hives." }],
        groups: [{ questions: [{ id: "q1", prompt: "Bees live in ____ on roofs." }] }],
      },
    ],
  });

  it("lists paragraphs and prompt parts", () => {
    expect([...blocks]).toEqual([
      ["p:s1:0", "Bees live in hives."],
      ["q:q1:0", "Bees live in "],
      ["q:q1:1", " on roofs."],
    ]);
  });

  it("reports unknown blocks, out-of-range and overlapping annotations", () => {
    expect(checkAnnotations([hl(0, 4), hl(5, 9)], blocks)).toEqual([]);
    expect(checkAnnotations([hl(0, 4, null, "p:nope:0")], blocks)).toHaveLength(1);
    expect(checkAnnotations([hl(0, 50)], blocks)).toHaveLength(1);
    expect(checkAnnotations([hl(0, 6), hl(5, 9)], blocks)).toHaveLength(1);
  });
});
