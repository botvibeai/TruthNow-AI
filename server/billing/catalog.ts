export type BillingProductType = "one_time" | "subscription";

export interface BillingProduct {
  id: string;
  name: string;
  type: BillingProductType;
  amountCents: number;
  currency: "USD";
  scanCredits: number;
  interval?: "MONTH";
  paypalPlanEnvironmentVariable?: string;
}

/** Server-owned catalog. The browser may send product IDs, never prices or credit quantities. */
export const BILLING_CATALOG: Readonly<Record<string, BillingProduct>> = Object.freeze({
  quick_start: Object.freeze({ id: "quick_start", name: "Quick-Start Pack", type: "one_time", amountCents: 199, currency: "USD", scanCredits: 20 }),
  special_trial: Object.freeze({ id: "special_trial", name: "Special Trial Pack", type: "one_time", amountCents: 699, currency: "USD", scanCredits: 100 }),
  growth_starter: Object.freeze({ id: "growth_starter", name: "Growth Starter", type: "subscription", amountCents: 2900, currency: "USD", scanCredits: 1000, interval: "MONTH", paypalPlanEnvironmentVariable: "PAYPAL_PLAN_GROWTH_STARTER" }),
  professional_suite: Object.freeze({ id: "professional_suite", name: "Professional Suite", type: "subscription", amountCents: 7900, currency: "USD", scanCredits: 5000, interval: "MONTH", paypalPlanEnvironmentVariable: "PAYPAL_PLAN_PROFESSIONAL_SUITE" }),
  enterprise_capacity: Object.freeze({ id: "enterprise_capacity", name: "Enterprise Capacity", type: "subscription", amountCents: 24900, currency: "USD", scanCredits: 25000, interval: "MONTH", paypalPlanEnvironmentVariable: "PAYPAL_PLAN_ENTERPRISE_CAPACITY" }),
});

export function getBillingProduct(productId: unknown): BillingProduct {
  if (typeof productId !== "string" || !Object.hasOwn(BILLING_CATALOG, productId)) throw new Error("UNKNOWN_BILLING_PRODUCT");
  return BILLING_CATALOG[productId];
}

export function toPayPalAmount(product: BillingProduct): string {
  return (product.amountCents / 100).toFixed(2);
}

export function getPublicBillingCatalog() {
  return Object.values(BILLING_CATALOG).map((product) => ({
    id: product.id, name: product.name, type: product.type,
    amount: toPayPalAmount(product), currency: product.currency,
    scanCredits: product.scanCredits, interval: product.interval ?? null,
  }));
}
