import Link from "next/link";

import { BUSINESS } from "../business";
import { ContactLine, LegalDocument, type LegalSection } from "../components/legal-document";

const sections: LegalSection[] = [
  {
    heading: "About these terms",
    body: (
      <p>
        These terms apply to your use of {BUSINESS.productName} (the &ldquo;service&rdquo;), run by{" "}
        {BUSINESS.operatorName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By creating an account or buying a
        package you agree to them. If you don&rsquo;t agree, please don&rsquo;t use the service.
      </p>
    ),
  },
  {
    heading: "The service",
    body: (
      <p>
        {BUSINESS.productName} offers online practice tests for IELTS Academic Reading and Listening, with
        automatic marking, band score estimates and answer review. It is a practice tool: it does not
        enrol you in, or book, an official IELTS test.
      </p>
    ),
  },
  {
    heading: "No affiliation with IELTS",
    body: (
      <p>
        IELTS is a registered trademark of the British Council, IDP: IELTS Australia and Cambridge
        University Press &amp; Assessment. {BUSINESS.productName} is independent and is not affiliated
        with, endorsed by or connected to them. Our tests are original material written to follow the
        public test format; they are not official test papers.
      </p>
    ),
  },
  {
    heading: "Your account",
    body: (
      <ul>
        <li>You sign in through our sign-in provider. Keep your login details private.</li>
        <li>An account is for one person. Don&rsquo;t share it or let others take tests with it.</li>
        <li>Give accurate information, and tell us if you think someone else is using your account.</li>
        <li>If you are under 18, you need the permission of a parent or guardian to use the service.</li>
      </ul>
    ),
  },
  {
    heading: "Free and paid access",
    body: (
      <>
        <p>
          Some tests are free. Paid packages give access to all tests for a fixed period (for example 30
          or 90 days), shown on the <Link href="/pricing" className="underline">pricing page</Link>.
        </p>
        <ul>
          <li>The access period starts when your payment is confirmed.</li>
          <li>Packages don&rsquo;t renew automatically; you choose whether to buy again.</li>
          <li>When the period ends, you keep your history and results, but can&rsquo;t start paid tests.</li>
        </ul>
      </>
    ),
  },
  {
    heading: "Payments",
    body: (
      <p>
        Prices are shown in Indonesian rupiah. Payments are processed by our payment partner, Midtrans,
        using the methods it offers (such as QRIS, bank transfer, e-wallets and cards). We don&rsquo;t see
        or store your card details. Access is granted once the payment partner confirms the payment.
      </p>
    ),
  },
  {
    heading: "Refunds",
    body: (
      <p>
        Refunds follow our <Link href="/refund-policy" className="underline">refund policy</Link>.
      </p>
    ),
  },
  {
    heading: "Fair use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>copy, record, publish or sell our test content, or share it outside the service;</li>
          <li>use bots, scripts or other tools to access tests or collect answers;</li>
          <li>try to get around the timer, access limits or security of the service;</li>
          <li>use the service in a way that is unlawful or harms other users.</li>
        </ul>
        <p>We may suspend or close accounts that break these rules.</p>
      </>
    ),
  },
  {
    heading: "Our content",
    body: (
      <p>
        The tests, questions, explanations and software belong to us or our licensors. Buying a package
        gives you a personal, non-transferable right to use them for your own practice during the access
        period.
      </p>
    ),
  },
  {
    heading: "Scores are estimates",
    body: (
      <p>
        Band scores are estimates based on published conversion ranges and your answers in our practice
        tests. They don&rsquo;t guarantee any result in an official IELTS test.
      </p>
    ),
  },
  {
    heading: "Availability and changes",
    body: (
      <p>
        We work to keep the service available, but it may sometimes be interrupted for maintenance or
        for reasons outside our control. We may update, add or remove tests and features. If a change
        significantly reduces what you paid for during an active package, contact us and we will find a
        fair solution.
      </p>
    ),
  },
  {
    heading: "Liability",
    body: (
      <p>
        To the extent the law allows, the service is provided &ldquo;as is&rdquo;, and our total liability
        to you is limited to the amount you paid us in the 12 months before the claim. Nothing in these
        terms limits rights you have under Indonesian consumer protection law.
      </p>
    ),
  },
  {
    heading: "Closing your account",
    body: (
      <p>
        You can ask us to close your account at any time. We may close an account that breaks these
        terms. Unused paid time is handled according to the refund policy.
      </p>
    ),
  },
  {
    heading: "Law",
    body: <p>These terms are governed by the laws of the Republic of Indonesia.</p>,
  },
  {
    heading: "Changes to these terms",
    body: (
      <p>
        We may update these terms. We will show the new date at the top of this page and, for important
        changes, tell you by email or in the service before they apply.
      </p>
    ),
  },
  { heading: "Contact", body: <ContactLine /> },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms and Conditions"
      intro={<p>Please read these terms before using {BUSINESS.productName} or buying a package.</p>}
      sections={sections}
    />
  );
}
