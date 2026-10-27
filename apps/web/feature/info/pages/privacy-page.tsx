import { BUSINESS } from "../business";
import { ContactLine, LegalDocument, type LegalSection } from "../components/legal-document";

const sections: LegalSection[] = [
  {
    heading: "Who we are",
    body: (
      <p>
        {BUSINESS.operatorName} runs {BUSINESS.productName} and is responsible for your personal data
        (the data controller). This policy explains what we collect, why, and the choices you have,
        in line with Indonesia&rsquo;s Personal Data Protection Law (Law No. 27 of 2022).
      </p>
    ),
  },
  {
    heading: "What we collect",
    body: (
      <ul>
        <li>
          <strong>Account details:</strong> your name and email address, from our sign-in provider when
          you create an account.
        </li>
        <li>
          <strong>Test activity:</strong> the tests you start, your answers, highlights, notes, flagged
          questions, scores and when you took each test.
        </li>
        <li>
          <strong>Payments:</strong> the package you bought, the amount, order number, payment status and
          method type. Card and bank details are handled by our payment partner, not by us.
        </li>
        <li>
          <strong>Technical data:</strong> basic logs (such as IP address, browser and error reports) to
          keep the service secure and working.
        </li>
      </ul>
    ),
  },
  {
    heading: "Why we use it",
    body: (
      <ul>
        <li>to create your account and let you sign in;</li>
        <li>to run tests, save your progress, mark your answers and show your history;</li>
        <li>to process payments and give you access to the package you bought;</li>
        <li>to answer your questions and send messages about your account or purchases;</li>
        <li>to keep the service secure, fix problems and improve our tests.</li>
      </ul>
    ),
  },
  {
    heading: "Legal basis",
    body: (
      <p>
        We process your data to provide the service you signed up for and paid for, to meet our legal
        obligations (for example keeping transaction records), and with your consent where it is needed.
        You can withdraw consent at any time; this doesn&rsquo;t affect processing that already happened.
      </p>
    ),
  },
  {
    heading: "Who we share it with",
    body: (
      <>
        <p>We don&rsquo;t sell your personal data. We share it only with providers that help us run the service:</p>
        <ul>
          <li>
            <strong>WorkOS</strong>: sign-in and account security.
          </li>
          <li>
            <strong>Midtrans</strong>: payment processing.
          </li>
          <li>
            <strong>DigitalOcean</strong>: hosting of our servers and database, in Singapore.
          </li>
        </ul>
        <p>
          Some of these providers process data outside Indonesia. We use providers that protect data to
          a standard at least comparable to Indonesian law. We may also disclose data when the law
          requires it.
        </p>
      </>
    ),
  },
  {
    heading: "How long we keep it",
    body: (
      <p>
        We keep your account and test history while your account is open. If you ask us to delete your
        account, we delete or anonymise your data, except records we must keep by law (such as payment
        records), which we keep only for as long as required.
      </p>
    ),
  },
  {
    heading: "Security",
    body: (
      <p>
        Data is sent over encrypted connections, access is limited to those who need it, and passwords
        are handled by our sign-in provider rather than stored by us. No system is completely secure;
        if a breach affects your data, we will tell you and the authorities as the law requires.
      </p>
    ),
  },
  {
    heading: "Your rights",
    body: (
      <>
        <p>You can ask us to:</p>
        <ul>
          <li>tell you what data we hold about you and give you a copy;</li>
          <li>correct data that is wrong or incomplete;</li>
          <li>delete your data or close your account;</li>
          <li>stop or limit certain processing, or withdraw consent.</li>
        </ul>
        <p>We reply within the time the law requires. We may need to confirm your identity first.</p>
      </>
    ),
  },
  {
    heading: "Cookies and browser storage",
    body: (
      <p>
        We use only the cookies needed to keep you signed in and secure. Your display settings (text
        size, colours, layout) are saved in your browser and never sent to us. We don&rsquo;t use
        advertising cookies.
      </p>
    ),
  },
  {
    heading: "Children",
    body: (
      <p>
        If you are under 18, please use the service with the permission of a parent or guardian, who
        can contact us about your data.
      </p>
    ),
  },
  {
    heading: "Changes to this policy",
    body: (
      <p>
        We may update this policy. We will show the new date at the top of this page and tell you about
        important changes.
      </p>
    ),
  },
  { heading: "Contact", body: <ContactLine /> },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      intro={<p>How {BUSINESS.productName} collects, uses and protects your personal data.</p>}
      sections={sections}
    />
  );
}
