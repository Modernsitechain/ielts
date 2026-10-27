import { BUSINESS } from "../business";
import { ContactLine, LegalDocument, type LegalSection } from "../components/legal-document";

const sections: LegalSection[] = [
  {
    heading: "When you can get a refund",
    body: (
      <ul>
        <li>
          Within {BUSINESS.refundWindowDays} days of buying a package, if you haven&rsquo;t started any
          paid test with it: full refund.
        </li>
        <li>If you were charged twice for the same order: the extra payment is refunded in full.</li>
        <li>
          If you paid but didn&rsquo;t receive access and we can&rsquo;t fix it: full refund.
        </li>
      </ul>
    ),
  },
  {
    heading: "When refunds aren't available",
    body: (
      <ul>
        <li>after you have started a paid test with the package;</li>
        <li>after {BUSINESS.refundWindowDays} days from purchase;</li>
        <li>after the access period has ended;</li>
        <li>if your account was closed for breaking our terms.</li>
      </ul>
    ),
  },
  {
    heading: "How to ask for a refund",
    body: (
      <p>
        Email {BUSINESS.email} from the address you use to sign in, with your order number (shown in
        your payment confirmation) and the reason. We reply within 3 working days.
      </p>
    ),
  },
  {
    heading: "How you are refunded",
    body: (
      <p>
        Approved refunds are processed within {BUSINESS.refundProcessingDays} working days, to the
        original payment method where possible. How soon the money reaches you depends on your bank or
        e-wallet. Access to the package ends when the refund is processed.
      </p>
    ),
  },
  {
    heading: "Your consumer rights",
    body: <p>This policy doesn&rsquo;t affect your rights under Indonesian consumer protection law.</p>,
  },
  { heading: "Contact", body: <ContactLine /> },
];

export default function RefundPolicyPage() {
  return (
    <LegalDocument
      title="Refund Policy"
      intro={<p>When and how you can get your money back for a {BUSINESS.productName} package.</p>}
      sections={sections}
    />
  );
}
