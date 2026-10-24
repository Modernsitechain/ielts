import type { ReactNode } from "react";

import { SiteLayout } from "@/shared/layouts/site-layout";

export default function Layout({ children }: { children: ReactNode }) {
  return <SiteLayout>{children}</SiteLayout>;
}
