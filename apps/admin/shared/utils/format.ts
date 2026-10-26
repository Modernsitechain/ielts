import type { QuestionType, Skill } from "@/core/models/test";

export const SKILL_LABEL: Record<Skill, string> = {
  reading: "Reading",
  listening: "Listening",
};

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  multiple_choice_single: "Multiple choice (one answer)",
  true_false_not_given: "True / False / Not Given",
  yes_no_not_given: "Yes / No / Not Given",
  matching_headings: "Matching headings",
  matching_information: "Matching information",
  sentence_completion: "Sentence completion",
  summary_completion: "Summary completion",
  form_completion: "Form completion (Listening)",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function formatDateTime(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
