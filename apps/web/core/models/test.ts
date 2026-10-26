// Test models are shared with apps/api; @ielts-mock/question-schema is the
// single source of truth. Public types only: answer keys never reach the web app.
export type {
  ChoiceOption,
  GroupPayload,
  Paragraph,
  Question,
  QuestionGroup,
  QuestionType,
  Section,
  Skill,
  TestDetail,
  TestModule,
  TestSummary,
} from "@ielts-mock/question-schema";

/** Answer choices shared by every TRUE/FALSE/NOT GIVEN and YES/NO/NOT GIVEN question. */
export { FIXED_CHOICES } from "@ielts-mock/question-schema";
