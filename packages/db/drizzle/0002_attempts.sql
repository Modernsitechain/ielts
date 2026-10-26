CREATE TYPE "public"."attempt_mode" AS ENUM('exam', 'practice');--> statement-breakpoint
CREATE TABLE "attempt_answers" (
	"attempt_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"value" text NOT NULL,
	"is_correct" boolean,
	CONSTRAINT "attempt_answers_attempt_id_question_id_pk" PRIMARY KEY("attempt_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"test_id" text NOT NULL,
	"mode" "attempt_mode" NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"submitted_at" timestamp with time zone,
	"raw_score" integer,
	"total_questions" integer,
	"band" numeric(3, 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attempts_ends_after_start" CHECK ("attempts"."ends_at" > "attempts"."started_at"),
	CONSTRAINT "attempts_scored_when_submitted" CHECK ("attempts"."submitted_at" IS NULL OR ("attempts"."raw_score" IS NOT NULL AND "attempts"."total_questions" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempts_user_submitted_idx" ON "attempts" USING btree ("user_id","submitted_at");--> statement-breakpoint
CREATE INDEX "attempts_test_idx" ON "attempts" USING btree ("test_id");