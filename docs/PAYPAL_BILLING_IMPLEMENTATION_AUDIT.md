# TruthNow AI — PayPal Billing Implementation Audit

## Scope

This audit records the current repository state before implementing real PayPal billing. It is intentionally non-destructive: no production credentials, payment settings, live transactions, or existing application behavior are changed by this document.

Repository: `botvibeai/TruthNow-AI`  
Working branch: `feature/paypal-billing-foundation`

## Confirmed repository state

- Frontend: React 19 + TypeScript + Vite.
- Backend: Express in `server.ts`, started through `tsx server.ts`.
- Authentication and client Firestore: Firebase Web SDK.
- Current package scripts: `dev`, `build`, `start`, `preview`, `clean`, and `lint`.
- No PayPal SDK or Firebase Admin SDK is currently listed in `package.json`.
- No automated test script is currently defined in `package.json`.

## Critical findings

### 1. Checkout is simulated, not connected to PayPal

`src/App.tsx` contains a simulated checkout flow. It asks for a PayPal email address and a field labelled PayPal password, then waits 1.8 seconds and adds credits in browser state.

This is not a PayPal integration. The password field must be removed; TruthNow AI must never collect or store a user's PayPal password. PayPal-hosted approval / PayPal JavaScript SDK UI must handle payer authentication.

### 2. The displayed pricing does not match the supplied commercial specification

Current frontend card values include:
- Trial: $6.99 for 20 scans.
- Growth: $29/month for 100 scans.
- Professional: $79/month for 400 scans.
- Enterprise: $249/month for 2,000 scans.

The supplied commercial specification says:
- Quick-Start: $1.99 for 20 scans.
- Special Trial: $6.99 for 100 scans.
- Growth: $29/month for 1,000 scans.
- Professional: $79/month for 5,000 scans.
- Enterprise: $249/month for 25,000 scans.

These are materially different entitlements. They must be reconciled and updated as one server-owned product catalog before accepting payments. The browser must never decide the amount or the number of credits to grant.

### 3. Scan credits are currently browser state

`remainingScans` is initialized in React and decremented locally. It is not a trusted, persistent entitlement ledger. Paid credits must be granted and debited by the server using Firebase Admin SDK transactions. The browser should only display the server-owned balance.

### 4. Existing Firestore rules need a deliberate billing extension

Current rules protect user profile fields and API-key subcollections, but there is no purchase ledger or server-owned billing balance. The implementation must:
- Permit a signed-in user to read only their own balance and purchase history.
- Deny all client writes to credit balances, subscription state, and purchase ledger records.
- Use Firebase Admin SDK only for billing mutations.
- Keep server-only service credentials out of the browser bundle and repository.

### 5. Payment processing requires idempotency

A payment can be captured and then delivered again through a webhook, or the client can retry after a timeout. Both paths must converge on one Firestore transaction keyed by the PayPal capture / sale identifier. A duplicate event must never grant duplicate credits.

### 6. Webhook verification and delivery handling are mandatory

The backend must verify PayPal's webhook signature using the configured webhook ID before processing an event. It must store event IDs / transaction IDs to prevent replay and duplicate fulfillment. The endpoint must return a 2xx response only after the event is durably handled (or safely recorded for retry).

### 7. Queue and image limits need separate validation

The supplied 1,050 ms upstream pacing interval and the advertised 140 ms priority SLA cannot both describe the same queue path. A single-process in-memory queue also cannot coordinate multiple server instances. This is outside the PayPal payment module and should be resolved separately.

Likewise, fixed JPEG quality does not mathematically guarantee a file below a specified byte limit. The compressor must check the final Blob size and iteratively reduce dimensions / quality or reject with a clear message.

## Target payment design

1. Product and price catalog is defined on the server; client sends only a stable product key.
2. Client obtains a Firebase ID token and starts checkout.
3. Backend verifies the Firebase token and creates the PayPal order / subscription using server credentials.
4. PayPal-hosted approval UI handles payer authentication.
5. Backend captures one-time orders and validates the PayPal response, currency, amount, status, and associated Firebase UID.
6. Verified webhooks are signature-checked and processed idempotently.
7. Firebase Admin SDK grants or renews credits in atomic transactions and writes an immutable audit ledger.
8. Client receives balance changes through a read-only Firestore listener.
9. Subscription cancellations and failed renewals update entitlement state without silently erasing previously purchased one-time credits.
10. Sandbox tests cover success, decline, cancellation, renewal, duplicate delivery, replay, wrong amount, wrong currency, wrong user, and transient network failures before live activation.

## Required deployment configuration (never commit these values)

- `PAYPAL_ENVIRONMENT=sandbox` or `live`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- Product ID (if using PayPal catalog registration)
- Plan IDs for Growth, Professional, and Enterprise
- Firebase Admin credentials through Google Application Default Credentials on Google Cloud, or a securely injected service-account credential in other hosting environments
- Public application origin / return URL configuration

Do not paste PayPal secrets or Firebase service-account private keys into chat, source files, client-side environment variables, or Git commits.

## Implementation gate

Do not enable live checkout until:
- Product allowances and prices are confirmed.
- Sandbox order and subscription flows pass end-to-end tests.
- Webhook signature verification is tested against PayPal Sandbox.
- Duplicate webhook delivery cannot double-credit an account.
- Firestore rules deny client-side billing mutations.
- A production deployment has server-side credentials and a configured webhook URL.
