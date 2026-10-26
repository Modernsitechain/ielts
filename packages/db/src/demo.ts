import { inArray } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { flattenContent } from "./content.js";
import * as schema from "./schema.js";
import { DEMO_TESTS } from "./seed-data/index.js";

/**
 * (Re)inserts the demo tests in seed-data/. Only the demo tests are replaced;
 * tests created in apps/admin are left untouched, so it is safe to run again.
 * The test rows are updated in place rather than deleted, because attempts
 * reference them (ON DELETE RESTRICT) and must survive a re-seed.
 */
export async function seedDemoTests(db: NodePgDatabase<typeof schema>): Promise<number> {
  await db.transaction(async (tx) => {
    // Groups and questions are removed with their sections (ON DELETE CASCADE).
    await tx.delete(schema.sections).where(
      inArray(
        schema.sections.testId,
        DEMO_TESTS.map((test) => test.id),
      ),
    );

    for (const { sections, ...test } of DEMO_TESTS) {
      const publishedAt = test.status === "published" ? new Date() : null;
      await tx
        .insert(schema.tests)
        .values({ ...test, publishedAt })
        .onConflictDoUpdate({
          target: schema.tests.id,
          set: { ...test, publishedAt, updatedAt: new Date() },
        });

      const rows = flattenContent(test.id, sections);
      if (rows.sections.length) await tx.insert(schema.sections).values(rows.sections);
      if (rows.groups.length) await tx.insert(schema.questionGroups).values(rows.groups);
      if (rows.questions.length) await tx.insert(schema.questions).values(rows.questions);
    }
  });
  return DEMO_TESTS.length;
}
