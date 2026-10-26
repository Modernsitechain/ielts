import { z } from "zod";

// Zod schemas for test content as written in apps/admin and validated by
// apps/api. The TypeScript types of question payloads are inferred from these
// schemas, so the validation rules and the types can't drift apart.
//
// Drafts may be incomplete (empty prompts, missing answers): structure and
// sizes are checked here, completeness only on publish (see publish.ts).

const MAX_TEXT = 2_000;

export const paragraphSchema = z.object({
  /** "A", "B", … for paragraphs that questions refer to; null otherwise. */
  label: z
    .string()
    .regex(/^[A-Z]$/, "Use a single capital letter")
    .nullable(),
  text: z.string().trim().max(10_000),
});
export type Paragraph = z.infer<typeof paragraphSchema>;

export const choiceOptionSchema = z.object({
  key: z.string().trim().min(1).max(10),
  text: z.string().trim().max(500),
});
export type ChoiceOption = z.infer<typeof choiceOptionSchema>;

/** e.g. "NO MORE THAN TWO WORDS AND/OR A NUMBER" → maxWords 2, allowNumber true. */
const wordLimit = {
  maxWords: z.int().min(1).max(5),
  allowNumber: z.boolean(),
};

/** Group-level data, discriminated by question type. */
export const groupPayloadSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("multiple_choice_single") }),
  z.object({ type: z.literal("true_false_not_given") }),
  z.object({ type: z.literal("yes_no_not_given") }),
  z.object({
    type: z.literal("matching_headings"),
    /** List of headings (i, ii, iii, …); usually more than there are questions. */
    headings: z.array(choiceOptionSchema).max(15),
  }),
  /** Statements matched to the labelled paragraphs of the same passage. */
  z.object({ type: z.literal("matching_information") }),
  z.object({ type: z.literal("sentence_completion"), ...wordLimit }),
  z.object({
    type: z.literal("summary_completion"),
    /** Heading shown above the summary, if any. */
    title: z.string().trim().max(200).nullable(),
    ...wordLimit,
  }),
  // Listening only; not editable in apps/admin yet.
  z.object({ type: z.literal("form_completion"), ...wordLimit }),
]);
export type GroupPayload = z.infer<typeof groupPayloadSchema>;

/** Answer choices that are the same for every question of the type. */
export const FIXED_CHOICES = {
  true_false_not_given: ["TRUE", "FALSE", "NOT GIVEN"],
  yes_no_not_given: ["YES", "NO", "NOT GIVEN"],
} as const;

/** Question types with a typed answer, graded against a word limit. */
export function isCompletionType(type: GroupPayload["type"]): boolean {
  return (
    type === "sentence_completion" ||
    type === "summary_completion" ||
    type === "form_completion"
  );
}

const idSchema = z.string().min(1).max(100);

export const questionInputSchema = z.object({
  /** Existing question id; omitted (or unknown) for new questions. */
  id: idSchema.optional(),
  /** Completion types mark the gap with at least three underscores: "___". */
  prompt: z.string().trim().max(MAX_TEXT),
  /** Multiple choice only; null for other types. */
  options: z.array(choiceOptionSchema).max(8).nullable(),
  /** Accepted answers. Completion types may list variants ("16", "sixteen"). */
  answers: z.array(z.string().trim().min(1).max(100)).max(10),
});

export const groupInputSchema = z.object({
  id: idSchema.optional(),
  instructions: z.string().trim().max(MAX_TEXT),
  payload: groupPayloadSchema,
  questions: z.array(questionInputSchema).max(40),
});

export const sectionInputSchema = z.object({
  id: idSchema.optional(),
  title: z.string().trim().max(200),
  paragraphs: z.array(paragraphSchema).max(40),
  groups: z.array(groupInputSchema).max(10),
});

/**
 * Body of PUT /admin/tests/:id: the whole editable content of a Reading test.
 * Order comes from array position; question numbers are assigned by the API.
 */
export const testInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  isFree: z.boolean(),
  durationMinutes: z.int().min(1).max(180),
  sections: z.array(sectionInputSchema).max(3, "A Reading test has at most 3 passages"),
});

/** Body of POST /admin/tests. */
export const createTestSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
});

export type QuestionInput = z.infer<typeof questionInputSchema>;
export type GroupInput = z.infer<typeof groupInputSchema>;
export type SectionInput = z.infer<typeof sectionInputSchema>;
export type TestInput = z.infer<typeof testInputSchema>;
export type CreateTestInput = z.infer<typeof createTestSchema>;
