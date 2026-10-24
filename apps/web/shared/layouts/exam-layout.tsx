import type { ReactNode } from "react";

/** Exam session layout: full screen, without the site header/footer. */
export function ExamLayout({ children }: { children: ReactNode }) {
  return <div className="h-screen overflow-hidden bg-white">{children}</div>;
}
