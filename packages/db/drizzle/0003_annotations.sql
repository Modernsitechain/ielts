CREATE TABLE "annotations" (
	"attempt_id" uuid NOT NULL,
	"block_id" text NOT NULL,
	"start_offset" integer NOT NULL,
	"end_offset" integer NOT NULL,
	"note" text,
	CONSTRAINT "annotations_attempt_id_block_id_start_offset_pk" PRIMARY KEY("attempt_id","block_id","start_offset"),
	CONSTRAINT "annotations_valid_range" CHECK ("annotations"."start_offset" >= 0 AND "annotations"."end_offset" > "annotations"."start_offset")
);
--> statement-breakpoint
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempts"("id") ON DELETE cascade ON UPDATE no action;