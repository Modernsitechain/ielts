import type { ReactNode } from "react";

import { BUSINESS } from "../business";

export type LegalSection = { heading: string; body: ReactNode };

/** Layout for a policy page: title, effective date and numbered sections. */
export function LegalDocument({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {BUSINESS.policiesUpdated}</p>
        <div className="mt-4 text-slate-700">{intro}</div>
      </header>
      <ol className="mt-8 space-y-8">
        {sections.map((section, index) => (
          <li key={section.heading}>
            <h2 className="text-lg font-semibold">
              {index + 1}. {section.heading}
            </h2>
            <div className="mt-2 space-y-3 leading-relaxed text-slate-700 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
              {section.body}
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

/** "Contact us" paragraph used at the end of each policy. */
export function ContactLine() {
  return (
    <p>
      Email {BUSINESS.email} or message us on WhatsApp at {BUSINESS.whatsapp}. Postal address:{" "}
      {BUSINESS.operatorName}, {BUSINESS.address}.
    </p>
  );
}
