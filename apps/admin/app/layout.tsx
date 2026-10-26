import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";

import { AdminLayout } from "@/shared/layouts/admin-layout";

import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "IELTS Mock Admin",
  description: "Manage IELTS Mock tests and questions.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="font-sans text-slate-900 antialiased">
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
