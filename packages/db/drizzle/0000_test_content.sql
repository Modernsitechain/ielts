CREATE TYPE "public"."section_kind" AS ENUM('passage', 'listening_part');--> statement-breakpoint
CREATE TYPE "public"."skill" AS ENUM('reading', 'listening');--> statement-breakpoint
CREATE TYPE "public"."test_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "question_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"section_id" text NOT NULL,
	"position" integer NOT NULL,
	"instructions" text NOT NULL,
	"payload" jsonb NOT NULL,
	CONSTRAINT "question_groups_section_position_unique" UNIQUE("section_id","position")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
	"position" integer NOT NULL,
	"number" integer NOT NULL,
	"prompt" text NOT NULL,
	"options" jsonb,
	"answers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "questions_group_position_unique" UNIQUE("group_id","position")
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" text PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"position" integer NOT NULL,
	"kind" "section_kind" NOT NULL,
	"title" text NOT NULL,
	"paragraphs" jsonb,
	"audio_url" text,
	CONSTRAINT "sections_test_position_unique" UNIQUE("test_id","position")
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"skill" "skill" NOT NULL,
	"module" text,
	"status" "test_status" DEFAULT 'draft' NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"duration_minutes" integer NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tests_duration_positive" CHECK ("tests"."duration_minutes" > 0)
);
--> statement-breakpoint
ALTER TABLE "question_groups" ADD CONSTRAINT "question_groups_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_group_id_question_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."question_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tests_status_idx" ON "tests" USING btree ("status");