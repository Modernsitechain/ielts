import type { ReactNode } from "react";

/** Layout sesi ujian: layar penuh, tanpa header/footer situs. */
export function ExamLayout({ children }: { children: ReactNode }) {
  return <div className="h-screen overflow-hidden bg-white">{children}</div>;
}
