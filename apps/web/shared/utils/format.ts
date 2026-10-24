import type { AttemptMode } from "@/core/models/attempt";
import type { QuestionType, Skill } from "@/core/models/test";

export const SKILL_LABEL: Record<Skill, string> = {
  reading: "Reading",
  listening: "Listening",
};

export const MODE_LABEL: Record<AttemptMode, string> = {
  exam: "Exam mode",
  practice: "Practice mode",
};

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  multiple_choice_single: "Multiple choice",
  true_false_not_given: "True / False / Not Given",
  sentence_completion: "Sentence completion",
  form_completion: "Form completion",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function formatDateTime(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatBand(band: number | null): string {
  return band === null ? "—" : band.toFixed(1);
}
