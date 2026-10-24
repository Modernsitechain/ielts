import type { ReactNode } from "react";

import { ExamLayout } from "@/shared/layouts/exam-layout";

export default function Layout({ children }: { children: ReactNode }) {
  return <ExamLayout>{children}</ExamLayout>;
}
