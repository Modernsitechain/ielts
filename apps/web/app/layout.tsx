import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "IELTS Mock",
  description: "Practise IELTS Academic Reading & Listening on computer.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="bg-white font-sans text-slate-900 antialiased">{children}</body>
    </html>
  );
}
