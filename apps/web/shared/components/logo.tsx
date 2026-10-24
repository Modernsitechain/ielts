import { GraduationCap } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-sm">
        <GraduationCap className="h-4.5 w-4.5" aria-hidden />
      </span>
      IELTS Mock
    </Link>
  );
}
