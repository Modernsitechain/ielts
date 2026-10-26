import type { GroupInput, QuestionInput, SectionInput, TestInput } from "./authoring.js";
import type { Skill, TestModule, TestStatus, TestSummary } from "./test.js";

// Shapes returned by the /admin endpoints. They include answers, so they are
// only for apps/admin and must never reach apps/web.
//
// AdminTest has the same shape as TestInput (with ids filled in), so the
// editor can send what it loaded straight back to PUT /admin/tests/:id.

export type AdminTestSummary = TestSummary & {
  status: TestStatus;
  updatedAt: string;
};

export type AdminQuestion = QuestionInput & { id: string };

export type AdminGroup = Omit<GroupInput, "id" | "questions"> & {
  id: string;
  questions: AdminQuestion[];
};

export type AdminSection = Omit<SectionInput, "id" | "groups"> & {
  id: string;
  groups: AdminGroup[];
};

export type AdminTest = Omit<TestInput, "sections"> & {
  id: string;
  skill: Skill;
  module: TestModule;
  status: TestStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  sections: AdminSection[];
};
