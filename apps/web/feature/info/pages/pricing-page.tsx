import { Check } from "lucide-react";
import Link from "next/link";

import { formatPrice, PACKAGES } from "../business";

const PAYMENT_METHODS = ["QRIS", "Bank transfer (virtual account)", "E-wallets", "Credit and debit cards"];

export default function PricingPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
        <p className="mt-3 text-slate-600">
          Start with the free tests. When you&rsquo;re ready, one payment unlocks every test for the whole
          access period. No subscription, no automatic renewal.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {PACKAGES.map((pack) => (
          <div key={pack.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold">{pack.name}</h2>
            <p className="mt-2 text-2xl font-bold">{formatPrice(pack.priceIdr)}</p>
            <p className="text-sm text-slate-500">
              {pack.accessDays ? `Access for ${pack.accessDays} days` : "No time limit"}
            </p>
            <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-700">
              {pack.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
            {pack.priceIdr === 0 ? (
              <Link
                href="/tests"
                className="mt-6 rounded-full bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-700"
              >
                Browse free tests
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-6 cursor-not-allowed rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500"
              >
                Coming soon
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 md:grid-cols-2">
        <div>
          <h2 className="font-semibold text-slate-900">How buying works</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Sign in and choose a package.</li>
            <li>Pay securely through Midtrans with your preferred method.</li>
            <li>Access starts as soon as the payment is confirmed.</li>
          </ol>
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Payment methods</h2>
          <p className="mt-2">{PAYMENT_METHODS.join(" · ")}</p>
          <p className="mt-3">
            Prices are in Indonesian rupiah. See the{" "}
            <Link href="/terms" className="underline">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/refund-policy" className="underline">
              refund policy
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
