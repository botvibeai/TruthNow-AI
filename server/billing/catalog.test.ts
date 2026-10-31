import test from "node:test";
import assert from "node:assert/strict";
import { BILLING_CATALOG, getBillingProduct, getPublicBillingCatalog, toPayPalAmount } from "./catalog.ts";

test("catalog defines the five approved products and exact scan allowances", () => {
  assert.deepEqual(Object.values(BILLING_CATALOG).map(({ id, amountCents, scanCredits, type }) => ({ id, amountCents, scanCredits, type })), [
    { id: "quick_start", amountCents: 199, scanCredits: 20, type: "one_time" },
    { id: "special_trial", amountCents: 699, scanCredits: 100, type: "one_time" },
    { id: "growth_starter", amountCents: 2900, scanCredits: 1000, type: "subscription" },
    { id: "professional_suite", amountCents: 7900, scanCredits: 5000, type: "subscription" },
    { id: "enterprise_capacity", amountCents: 24900, scanCredits: 25000, type: "subscription" },
  ]);
});

test("PayPal amounts are formatted from integer cents", () => {
  assert.equal(toPayPalAmount(getBillingProduct("quick_start")), "1.99");
  assert.equal(toPayPalAmount(getBillingProduct("special_trial")), "6.99");
  assert.equal(toPayPalAmount(getBillingProduct("enterprise_capacity")), "249.00");
});

test("unknown or non-string product keys are rejected", () => {
  assert.throws(() => getBillingProduct("custom_price"), /UNKNOWN_BILLING_PRODUCT/);
  assert.throws(() => getBillingProduct(699), /UNKNOWN_BILLING_PRODUCT/);
  assert.throws(() => getBillingProduct({ price: 0.01 }), /UNKNOWN_BILLING_PRODUCT/);
});

test("public catalog does not expose PayPal plan IDs or environment variable names", () => {
  const serialized = JSON.stringify(getPublicBillingCatalog());
  assert.equal(serialized.includes("PAYPAL_PLAN_"), false);
  assert.equal(serialized.includes("planId"), false);
});
