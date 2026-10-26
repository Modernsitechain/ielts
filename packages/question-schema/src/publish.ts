import { BLANK_PATTERN as BLANK } from "./annotation.js";
import { FIXED_CHOICES, isCompletionType, type TestInput } from "./authoring.js";
import { withinWordLimit } from "./scoring.js";

// Completeness check before a test goes live. Pure, so apps/admin shows the
// same problems while editing that apps/api enforces on publish.

export type PublishCheck = {
  /** Blocking: the test can't be published until these are fixed. */
  errors: string[];
  /** Allowed, but worth knowing (e.g. no band score for a short test). */
  warnings: string[];
};

const FULL_TEST_QUESTIONS = 40;
const FULL_TEST_PASSAGES = 3;

function hasDuplicates(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

export function checkPublishReadiness(test: TestInput): PublishCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  let number = 0;

  if (test.sections.length === 0) errors.push("Add at least one passage.");
  else if (test.sections.length !== FULL_TEST_PASSAGES) {
    warnings.push(`A full Reading test has ${FULL_TEST_PASSAGES} passages.`);
  }

  test.sections.forEach((section, sectionIndex) => {
    const where = `Passage ${sectionIndex + 1}`;
    const labels = section.paragraphs.flatMap((p) => (p.label ? [p.label] : []));

    if (!section.title) errors.push(`${where}: add a title.`);
    if (section.paragraphs.length === 0) errors.push(`${where}: add the passage text.`);
    section.paragraphs.forEach((paragraph, index) => {
      if (!paragraph.text) errors.push(`${where}: paragraph ${index + 1} is empty.`);
    });
    if (hasDuplicates(labels)) errors.push(`${where}: paragraph labels must be unique.`);
    if (section.groups.length === 0) errors.push(`${where}: add at least one question group.`);

    section.groups.forEach((group, groupIndex) => {
      const { payload } = group;
      const from = number + 1;
      const to = number + group.questions.length;
      const groupWhere =
        group.questions.length > 0 ? `Questions ${from}–${to}` : `${where}, group ${groupIndex + 1}`;

      if (group.questions.length === 0) errors.push(`${groupWhere}: add at least one question.`);
      if (!group.instructions) errors.push(`${groupWhere}: add instructions.`);

      if (payload.type === "matching_headings") {
        const keys = payload.headings.map((h) => h.key);
        if (payload.headings.length < 2) errors.push(`${groupWhere}: add at least 2 headings.`);
        if (hasDuplicates(keys)) errors.push(`${groupWhere}: heading numbers must be unique.`);
        if (payload.headings.some((h) => !h.text)) {
          errors.push(`${groupWhere}: every heading needs text.`);
        }
        const used = group.questions.flatMap((q) => q.answers.slice(0, 1));
        if (hasDuplicates(used)) errors.push(`${groupWhere}: a heading can only be used once.`);
      }
      if (payload.type === "matching_information" && labels.length === 0) {
        errors.push(`${groupWhere}: label the paragraphs of ${where} (A, B, C…) first.`);
      }

      group.questions.forEach((question) => {
        number += 1;
        const q = `Question ${number}`;
        const [answer] = question.answers;

        if (!question.prompt) errors.push(`${q}: add the question text.`);
        if (!answer) {
          errors.push(`${q}: add the correct answer.`);
          return;
        }

        if (isCompletionType(payload.type) && "maxWords" in payload) {
          if (question.prompt && !BLANK.test(question.prompt)) {
            errors.push(`${q}: mark the gap with ___ in the question text.`);
          }
          for (const variant of question.answers) {
            if (!withinWordLimit(variant, payload.maxWords, payload.allowNumber)) {
              errors.push(`${q}: "${variant}" is longer than the word limit.`);
            }
          }
          return;
        }

        if (question.answers.length > 1) errors.push(`${q}: choose exactly one answer.`);

        let allowed: readonly string[] = [];
        switch (payload.type) {
          case "multiple_choice_single": {
            const options = question.options ?? [];
            allowed = options.map((o) => o.key);
            if (options.length < 2) errors.push(`${q}: add at least 2 options.`);
            if (options.some((o) => !o.text)) errors.push(`${q}: every option needs text.`);
            if (hasDuplicates([...allowed])) errors.push(`${q}: option letters must be unique.`);
            break;
          }
          case "true_false_not_given":
          case "yes_no_not_given":
            allowed = FIXED_CHOICES[payload.type];
            break;
          case "matching_headings":
            allowed = payload.headings.map((h) => h.key);
            break;
          case "matching_information":
            allowed = labels;
            break;
          case "sentence_completion":
          case "summary_completion":
          case "form_completion":
            break;
          default: {
            const unhandled: never = payload;
            return unhandled;
          }
        }
        if (!allowed.includes(answer)) errors.push(`${q}: the answer "${answer}" isn't one of the choices.`);
      });
    });
  });

  if (number > 0 && number !== FULL_TEST_QUESTIONS) {
    warnings.push(
      `This test has ${number} questions. A full test has ${FULL_TEST_QUESTIONS}; band scores are only shown for full tests.`,
    );
  }
  return { errors, warnings };
}
