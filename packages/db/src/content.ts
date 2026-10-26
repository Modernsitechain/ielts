import type { questionGroups, questions, sections } from "./schema.js";

// A test's content as a tree, the way it is edited. Stored as rows in three
// tables; flattenContent assigns positions and global question numbers.

export type QuestionNode = Omit<typeof questions.$inferInsert, "groupId" | "position" | "number"> & {
  id: string;
};

export type GroupNode = Omit<typeof questionGroups.$inferInsert, "sectionId" | "position"> & {
  id: string;
  questions: QuestionNode[];
};

export type SectionNode = Omit<typeof sections.$inferInsert, "testId" | "position"> & {
  id: string;
  groups: GroupNode[];
};

export type ContentRows = {
  sections: (typeof sections.$inferInsert)[];
  groups: (typeof questionGroups.$inferInsert)[];
  questions: (typeof questions.$inferInsert)[];
};

/** Turns the tree into rows. Positions start at 1; numbers run 1–40 across the test. */
export function flattenContent(testId: string, tree: SectionNode[]): ContentRows {
  const rows: ContentRows = { sections: [], groups: [], questions: [] };
  let number = 0;

  tree.forEach(({ groups, ...section }, sectionIndex) => {
    rows.sections.push({ ...section, testId, position: sectionIndex + 1 });
    groups.forEach(({ questions: groupQuestions, ...group }, groupIndex) => {
      rows.groups.push({ ...group, sectionId: section.id, position: groupIndex + 1 });
      groupQuestions.forEach((question, questionIndex) => {
        number += 1;
        rows.questions.push({ ...question, groupId: group.id, position: questionIndex + 1, number });
      });
    });
  });
  return rows;
}
