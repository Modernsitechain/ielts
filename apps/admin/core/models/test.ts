// Test models are shared with apps/api; @ielts-mock/question-schema is the
// single source of truth. Admin types include answers: never pass them to apps/web.
export type {
  AdminGroup,
  AdminQuestion,
  AdminSection,
  AdminTest,
  AdminTestSummary,
  ChoiceOption,
  GroupPayload,
  Paragraph,
  PublishCheck,
  QuestionType,
  Skill,
  TestInput,
  TestStatus,
} from "@ielts-mock/question-schema";

// Shared rules, so the editor shows the same problems the API enforces.
export { checkPublishReadiness, FIXED_CHOICES, isCompletionType } from "@ielts-mock/question-schema";
