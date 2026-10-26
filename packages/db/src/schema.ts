import {
  type ChoiceOption,
  type GroupPayload,
  type Paragraph,
  USER_ROLES,
} from "@ielts-mock/question-schema";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  primaryKey,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// Test content: tests → sections → question_groups → questions. Users and
// attempts below.
// Changing this file? Run `pnpm db:generate` to create a migration, review the
// SQL in drizzle/, then `pnpm db:migrate`. See packages/db/AGENTS.md.
//
// Ids are text: demo content keeps readable ids ("reading-demo-1"), new rows
// get a UUID from apps/api.

export const skillEnum = pgEnum("skill", ["reading", "listening"]);
export const testStatusEnum = pgEnum("test_status", ["draft", "published"]);
export const sectionKindEnum = pgEnum("section_kind", ["passage", "listening_part"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const tests = pgTable(
  "tests",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    skill: skillEnum("skill").notNull(),
    /** "academic" for Reading; null for Listening (same for both modules). */
    module: text("module").$type<"academic">(),
    status: testStatusEnum("status").notNull().default("draft"),
    isFree: boolean("is_free").notNull().default(false),
    durationMinutes: integer("duration_minutes").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    check("tests_duration_positive", sql`${table.durationMinutes} > 0`),
    // The candidate catalogue only lists published tests.
    index("tests_status_idx").on(table.status),
  ],
);

export const sections = pgTable(
  "sections",
  {
    id: text("id").primaryKey(),
    testId: text("test_id")
      .notNull()
      .references(() => tests.id, { onDelete: "cascade" }),
    /** Order within the test, starting at 1. */
    position: integer("position").notNull(),
    kind: sectionKindEnum("kind").notNull(),
    title: text("title").notNull(),
    /** Reading passage, one entry per paragraph. Null for Listening. */
    paragraphs: jsonb("paragraphs").$type<Paragraph[]>(),
    /** Listening audio. Null for Reading or until uploaded. */
    audioUrl: text("audio_url"),
  },
  (table) => [unique("sections_test_position_unique").on(table.testId, table.position)],
);

export const questionGroups = pgTable(
  "question_groups",
  {
    id: text("id").primaryKey(),
    sectionId: text("section_id")
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    instructions: text("instructions").notNull(),
    /** Type-specific data (word limit, headings, …), validated with Zod in apps/api. */
    payload: jsonb("payload").$type<GroupPayload>().notNull(),
  },
  (table) => [unique("question_groups_section_position_unique").on(table.sectionId, table.position)],
);

export const questions = pgTable(
  "questions",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => questionGroups.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    /** Global number 1–40 within the test, assigned by apps/api on save. */
    number: integer("number").notNull(),
    prompt: text("prompt").notNull(),
    /** Multiple choice options; null for other types. */
    options: jsonb("options").$type<ChoiceOption[]>(),
    /** Accepted answers. Never sent to candidates before submission. */
    answers: jsonb("answers").$type<string[]>().notNull().default([]),
  },
  (table) => [unique("questions_group_position_unique").on(table.groupId, table.position)],
);

// Users: identity comes from WorkOS (sign-in), the role is ours. A row is
// created by apps/api the first time someone signs in, as a student.
export const userRoleEnum = pgEnum("user_role", USER_ROLES);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** WorkOS user id ("user_01…"), the `sub` claim of the access token. */
  workosUserId: text("workos_user_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  role: userRoleEnum("role").notNull().default("student"),
  ...timestamps,
});

// Attempts: one row per test session, answers in attempt_answers. Times and
// scores are decided by apps/api; scores are stored at submission, so later
// edits to a test don't change past results.
export const attemptModeEnum = pgEnum("attempt_mode", ["exam", "practice"]);

export const attempts = pgTable(
  "attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** RESTRICT: a test with attempts can't be deleted (candidates' history). */
    testId: text("test_id")
      .notNull()
      .references(() => tests.id, { onDelete: "restrict" }),
    mode: attemptModeEnum("mode").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    /** Deadline set by the server when the attempt starts. */
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    /** Null while the attempt is in progress. */
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    // Filled at submission.
    rawScore: integer("raw_score"),
    totalQuestions: integer("total_questions"),
    /** Null when no band applies (e.g. a test with fewer than 40 questions). */
    band: numeric("band", { precision: 3, scale: 1, mode: "number" }),
    ...timestamps,
  },
  (table) => [
    check("attempts_ends_after_start", sql`${table.endsAt} > ${table.startedAt}`),
    check(
      "attempts_scored_when_submitted",
      sql`${table.submittedAt} IS NULL OR (${table.rawScore} IS NOT NULL AND ${table.totalQuestions} IS NOT NULL)`,
    ),
    // History: a user's attempts, newest submission first.
    index("attempts_user_submitted_idx").on(table.userId, table.submittedAt),
    // Admin delete check and future stats per test.
    index("attempts_test_idx").on(table.testId),
  ],
);

export const attemptAnswers = pgTable(
  "attempt_answers",
  {
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => attempts.id, { onDelete: "cascade" }),
    /**
     * No foreign key to questions on purpose: editing a test may delete
     * questions, and past answers must survive that.
     */
    questionId: text("question_id").notNull(),
    value: text("value").notNull(),
    /** Set at submission. */
    isCorrect: boolean("is_correct"),
  },
  (table) => [primaryKey({ columns: [table.attemptId, table.questionId] })],
);

/**
 * Highlights and notes on a test's text (`blockId` + character range; see
 * annotation.ts in @ielts-mock/question-schema). Ranges in one block never
 * overlap, so (attempt, block, start) identifies an annotation.
 */
export const annotations = pgTable(
  "annotations",
  {
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => attempts.id, { onDelete: "cascade" }),
    blockId: text("block_id").notNull(),
    startOffset: integer("start_offset").notNull(),
    endOffset: integer("end_offset").notNull(),
    /** Null for a plain highlight. */
    note: text("note"),
  },
  (table) => [
    primaryKey({ columns: [table.attemptId, table.blockId, table.startOffset] }),
    check("annotations_valid_range", sql`${table.startOffset} >= 0 AND ${table.endOffset} > ${table.startOffset}`),
  ],
);

// Relations let apps/api load a whole test in one query (`db.query.tests`).
// They don't change the database; foreign keys above do.

export const testsRelations = relations(tests, ({ many }) => ({
  sections: many(sections),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  test: one(tests, { fields: [sections.testId], references: [tests.id] }),
  groups: many(questionGroups),
}));

export const questionGroupsRelations = relations(questionGroups, ({ one, many }) => ({
  section: one(sections, { fields: [questionGroups.sectionId], references: [sections.id] }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  group: one(questionGroups, { fields: [questions.groupId], references: [questionGroups.id] }),
}));

export const attemptsRelations = relations(attempts, ({ many }) => ({
  answers: many(attemptAnswers),
  annotations: many(annotations),
}));

export const annotationsRelations = relations(annotations, ({ one }) => ({
  attempt: one(attempts, { fields: [annotations.attemptId], references: [attempts.id] }),
}));

export const attemptAnswersRelations = relations(attemptAnswers, ({ one }) => ({
  attempt: one(attempts, { fields: [attemptAnswers.attemptId], references: [attempts.id] }),
}));
