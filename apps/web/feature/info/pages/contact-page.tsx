import { Mail, MapPin, MessageCircle } from "lucide-react";

import { BUSINESS } from "../business";

const CHANNELS = [
  { icon: Mail, label: "Email", value: BUSINESS.email },
  { icon: MessageCircle, label: "WhatsApp", value: BUSINESS.whatsapp },
  { icon: MapPin, label: "Address", value: `${BUSINESS.operatorName}, ${BUSINESS.address}` },
];

export default function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Contact us</h1>
      <p className="mt-3 text-slate-600">
        Questions about your account, a payment or a test? Get in touch and we&rsquo;ll reply within 3
        working days. For payments, please include your order number.
      </p>
      <ul className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {CHANNELS.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-start gap-4 p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-slate-600">{value}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-slate-500">{BUSINESS.productName} is operated by {BUSINESS.operatorName}.</p>
    </section>
  );
}
