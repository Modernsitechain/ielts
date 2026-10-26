import type { AdminGroup, AdminQuestion, GroupPayload, QuestionType } from "@/core/models/test";

// Starting values for new items in the editor. Pure functions, no state.

/** Question types that can be added to a Reading test. */
export const READING_TYPES = [
  "multiple_choice_single",
  "true_false_not_given",
  "yes_no_not_given",
  "matching_headings",
  "matching_information",
  "sentence_completion",
  "summary_completion",
] as const satisfies readonly QuestionType[];

export type ReadingType = (typeof READING_TYPES)[number];

const NUMBER_WORDS = ["ONE", "TWO", "THREE", "FOUR", "FIVE"];
const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv"];

export function newId(): string {
  return crypto.randomUUID();
}

/** "NO MORE THAN TWO WORDS AND/OR A NUMBER", "ONE WORD ONLY", … */
export function wordLimitText(maxWords: number, allowNumber: boolean): string {
  const count = NUMBER_WORDS[maxWords - 1] ?? String(maxWords);
  if (maxWords === 1) return allowNumber ? "ONE WORD AND/OR A NUMBER" : "ONE WORD ONLY";
  return `NO MORE THAN ${count} WORDS${allowNumber ? " AND/OR A NUMBER" : ""}`;
}

export function defaultPayload(type: ReadingType): GroupPayload {
  switch (type) {
    case "matching_headings":
      return {
        type,
        headings: ROMAN.slice(0, 4).map((key) => ({ key, text: "" })),
      };
    case "sentence_completion":
      return { type, maxWords: 2, allowNumber: true };
    case "summary_completion":
      return { type, title: null, maxWords: 2, allowNumber: false };
    default:
      return { type };
  }
}

/** Standard IELTS-style instructions for a group, based on its settings. */
export function defaultInstructions(payload: GroupPayload): string {
  switch (payload.type) {
    case "multiple_choice_single":
      return "Choose the correct letter, A, B, C or D.";
    case "true_false_not_given":
      return "Do the following statements agree with the information given in the reading passage? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.";
    case "yes_no_not_given":
      return "Do the following statements agree with the claims of the writer in the reading passage? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.";
    case "matching_headings":
      return "The reading passage has several paragraphs. Choose the correct heading for each paragraph from the list of headings below.";
    case "matching_information":
      return "The reading passage has several paragraphs. Which paragraph contains the following information? You may use any letter more than once.";
    case "sentence_completion":
      return `Complete the sentences below. Choose ${wordLimitText(payload.maxWords, payload.allowNumber)} from the passage for each answer.`;
    case "summary_completion":
      return `Complete the summary below. Choose ${wordLimitText(payload.maxWords, payload.allowNumber)} from the passage for each answer.`;
    case "form_completion":
      return `Complete the form below. Write ${wordLimitText(payload.maxWords, payload.allowNumber)} for each answer.`;
    default: {
      const unhandled: never = payload;
      return unhandled;
    }
  }
}

export function newQuestion(type: QuestionType): AdminQuestion {
  return {
    id: newId(),
    prompt: "",
    options:
      type === "multiple_choice_single"
        ? ["A", "B", "C", "D"].map((key) => ({ key, text: "" }))
        : null,
    answers: [],
  };
}

export function newGroup(type: ReadingType): AdminGroup {
  const payload = defaultPayload(type);
  return {
    id: newId(),
    instructions: defaultInstructions(payload),
    payload,
    questions: [newQuestion(type)],
  };
}

/** Next roman numeral for a list of headings. */
export function nextHeadingKey(count: number): string {
  return ROMAN[count] ?? String(count + 1);
}

// Immutable list helpers for nested editor state.

export function replaceAt<T>(list: T[], index: number, item: T): T[] {
  return list.map((current, i) => (i === index ? item : current));
}

export function removeAt<T>(list: T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

export function move<T>(list: T[], index: number, offset: -1 | 1): T[] {
  const target = index + offset;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target] as T, next[index] as T];
  return next;
}
