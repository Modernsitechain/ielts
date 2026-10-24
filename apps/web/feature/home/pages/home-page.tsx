import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-4 py-12">
      <h1 className="text-3xl font-bold">Latihan IELTS on computer, sebelum hari tes</h1>
      <p className="max-w-2xl text-slate-600">
        Kerjakan mock test Academic Reading &amp; Listening dengan antarmuka yang
        meniru IELTS on computer: split screen, highlight, catatan, navigasi soal,
        dan timer.
      </p>
      <Link
        href="/tests"
        className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Lihat katalog tes
      </Link>
    </section>
  );
}
