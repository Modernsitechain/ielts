import type { ChoiceOption, GroupPayload, Paragraph } from "@ielts-mock/question-schema";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// Test content: tests → sections → question_groups → questions.
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
