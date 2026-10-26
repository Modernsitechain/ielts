import type { SectionNode } from "../content.js";
import type { tests } from "../schema.js";

/** A demo test as written in seed-data/, inserted by `pnpm db:seed`. */
export type SeedTest = Omit<typeof tests.$inferInsert, "createdAt" | "updatedAt"> & {
  id: string;
  sections: SectionNode[];
};
