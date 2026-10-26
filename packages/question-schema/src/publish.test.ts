import { describe, expect, it } from "vitest";

import type { GroupInput, TestInput } from "./authoring.js";
import { checkPublishReadiness } from "./publish.js";

function testWith(groups: GroupInput[]): TestInput {
  return {
    title: "Test",
    isFree: false,
    durationMinutes: 60,
    sections: [
      {
        title: "Passage 1",
        paragraphs: [
          { label: "A", text: "First paragraph." },
          { label: "B", text: "Second paragraph." },
        ],
        groups,
      },
    ],
  };
}

describe("checkPublishReadiness", () => {
  it("accepts a complete short test, with warnings about its length", () => {
    const result = checkPublishReadiness(
      testWith([
        {
          instructions: "Write TRUE, FALSE or NOT GIVEN.",
          payload: { type: "true_false_not_given" },
          questions: [{ prompt: "Statement.", options: null, answers: ["TRUE"] }],
        },
      ]),
    );

    expect(result.errors).toEqual([]);
    expect(result.warnings).toHaveLength(2);
  });

  it("rejects an empty test", () => {
    const result = checkPublishReadiness({ ...testWith([]), sections: [] });

    expect(result.errors).toEqual(["Add at least one passage."]);
  });

  it("numbers questions across groups when reporting problems", () => {
    const result = checkPublishReadiness(
      testWith([
        {
          instructions: "Choose the correct letter.",
          payload: { type: "multiple_choice_single" },
          questions: [
            {
              prompt: "Question?",
              options: [
                { key: "A", text: "Yes" },
                { key: "B", text: "No" },
              ],
              answers: ["C"],
            },
          ],
        },
        {
          instructions: "Complete the sentences.",
          payload: { type: "sentence_completion", maxWords: 2, allowNumber: true },
          questions: [
            { prompt: "Bees visit ___ flowers.", options: null, answers: ["hundreds of wild"] },
            { prompt: "No gap here.", options: null, answers: ["many"] },
          ],
        },
      ]),
    );

    expect(result.errors).toEqual([
      'Question 1: the answer "C" isn\'t one of the choices.',
      'Question 2: "hundreds of wild" is longer than the word limit.',
      "Question 3: mark the gap with ___ in the question text.",
    ]);
  });

  it("requires labelled paragraphs for matching information", () => {
    const test = testWith([
      {
        instructions: "Which paragraph contains the following information?",
        payload: { type: "matching_information" },
        questions: [{ prompt: "A mention of honey.", options: null, answers: ["C"] }],
      },
    ]);

    expect(checkPublishReadiness(test).errors).toEqual([
      'Question 1: the answer "C" isn\'t one of the choices.',
    ]);

    const unlabelled = {
      ...test,
      sections: test.sections.map((s) => ({
        ...s,
        paragraphs: s.paragraphs.map((p) => ({ ...p, label: null })),
      })),
    };
    expect(checkPublishReadiness(unlabelled).errors[0]).toBe(
      "Questions 1–1: label the paragraphs of Passage 1 (A, B, C…) first.",
    );
  });

  it("doesn't allow a heading to be used twice", () => {
    const result = checkPublishReadiness(
      testWith([
        {
          instructions: "Choose the correct heading for each paragraph.",
          payload: {
            type: "matching_headings",
            headings: [
              { key: "i", text: "A growing hobby" },
              { key: "ii", text: "Too many hives?" },
            ],
          },
          questions: [
            { prompt: "Paragraph A", options: null, answers: ["i"] },
            { prompt: "Paragraph B", options: null, answers: ["i"] },
          ],
        },
      ]),
    );

    expect(result.errors).toEqual(["Questions 1–2: a heading can only be used once."]);
  });
});
