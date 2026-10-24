// Test models as seen by candidates. Follows the data model sketch in
// docs/project-brief.md; will move to packages/question-schema (Zod) in
// Phase 2.
//
// Answer keys are DELIBERATELY absent here: tests sent to candidates must
// not carry answers before submission (see records.ts).

export type Skill = "reading" | "listening";
export type TestModule = "academic" | null;

export type TestSummary = {
  id: string;
  title: string;
  skill: Skill;
  module: TestModule;
  isFree: boolean;
  durationMinutes: number;
  questionCount: number;
};

export type ChoiceOption = {
  key: string;
  text: string;
};

export type Question = {
  id: string;
  /** Global number 1–40 within a test. */
  number: number;
  prompt: string;
  options: ChoiceOption[] | null;
};

/** Group-level data, discriminated by question type. */
export type GroupPayload =
  | { type: "multiple_choice_single" }
  | { type: "true_false_not_given" }
  | { type: "sentence_completion"; maxWords: number; allowNumber: boolean }
  | { type: "form_completion"; maxWords: number; allowNumber: boolean };

export type QuestionType = GroupPayload["type"];

export type QuestionGroup = {
  id: string;
  order: number;
  numberFrom: number;
  numberTo: number;
  instructions: string;
  payload: GroupPayload;
  questions: Question[];
};

export type Section = {
  id: string;
  order: number;
  kind: "passage" | "listening_part";
  title: string;
  /** Passage text (Reading). Null for Listening. */
  content: string | null;
  /** Audio URL (Listening). Null for Reading or when not uploaded yet. */
  audioUrl: string | null;
  groups: QuestionGroup[];
};

export type TestDetail = TestSummary & {
  sections: Section[];
};
