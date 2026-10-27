// Business details shown on the legal, pricing and contact pages. DRAFT:
// values marked "to be confirmed" must be filled in, and the policy texts
// reviewed by someone qualified, before payments go live (see
// docs/progress-log.md, "Halaman legal").

export const BUSINESS = {
  /**
   * Working name. The final brand should not contain "IELTS" (a registered
   * trademark); see docs/progress-log.md.
   */
  productName: "IELTS Mock",
  /**
   * Who runs the service and receives payments. Until Modernsitechain is a
   * registered company, add the owner's full legal name ("Modernsitechain,
   * operated by …").
   */
  operatorName: "Modernsitechain",
  email: "modernsitechain@gmail.com",
  whatsapp: "+62 896-3895-9321",
  address: "30287 Bandung, Indonesia",
  /** Days after purchase in which an unused package can be refunded. */
  refundWindowDays: 7,
  /** Working days to process an approved refund. */
  refundProcessingDays: 14,
  /** Date the current versions of the policies take effect. */
  policiesUpdated: "30 October 2026",
} as const;

export type Package = {
  name: string;
  accessDays: number | null;
  /** Price in rupiah; null while it is still to be decided. */
  priceIdr: number | null;
  features: string[];
};

export const PACKAGES: Package[] = [
  {
    name: "Free tests",
    accessDays: null,
    priceIdr: 0,
    features: ["Free sample tests", "Instant score and band estimate", "Answer review after each test"],
  },
  {
    name: "30 days",
    accessDays: 30,
    priceIdr: null,
    features: [
      "Every Reading and Listening test",
      "Highlights, notes and flags",
      "Full answer review and history",
    ],
  },
  {
    name: "90 days",
    accessDays: 90,
    priceIdr: null,
    features: [
      "Everything in 30 days",
      "Three months to prepare at your own pace",
      "Best value per day",
    ],
  },
];

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function formatPrice(priceIdr: number | null): string {
  if (priceIdr === null) return "Price to be announced";
  return priceIdr === 0 ? "Free" : rupiah.format(priceIdr);
}
