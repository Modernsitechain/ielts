// Test models shared by apps/web, apps/admin and apps/api. Follows the data
// model sketch in docs/project-brief.md.
//
// Answer keys are DELIBERATELY absent from these public types: tests sent to
// candidates must not carry answers before submission (see AnswerKey).

import type { GroupPayload, Paragraph } from "./authoring.js";

export type Skill = "reading" | "listening";
export type TestModule = "academic" | null;
/** Only published tests are visible to candidates. */
export type TestStatus = "draft" | "published";

export type TestSummary = {
  id: string;
  title: string;
  skill: Skill;
  module: TestModule;
  isFree: boolean;
  durationMinutes: number;
  questionCount: number;
};

export type Question = {
  id: string;
  /** Global number 1–40 within a test. */
  number: number;
  prompt: string;
  options: { key: string; text: string }[] | null;
};

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
  /** Passage text (Reading), one entry per paragraph. Null for Listening. */
  paragraphs: Paragraph[] | null;
  /** Audio URL (Listening). Null for Reading or when not uploaded yet. */
  audioUrl: string | null;
  groups: QuestionGroup[];
};

export type TestDetail = TestSummary & {
  sections: Section[];
};

/** Accepted answers per question id. Server only; never sent before submission. */
export type AnswerKey = Record<string, string[]>;
