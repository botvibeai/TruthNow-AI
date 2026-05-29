# Security Specification

## Data Invariants
1. **User Identity Invariant**: A user's profile document `/users/{userId}` can only be read, created, updated, or deleted by the user themselves (`request.auth.uid == userId`).
2. **API Key Ownership**: API keys under `/users/{userId}/apiKeys/{keyId}` can only be accessed by the parent user (`request.auth.uid == userId`).
3. **Public Reviews**: Public reviews can be read by anyone (including anonymous/unauthenticated visitors), but can only be written (create) by authenticated users, setting their own `userId` field if signed in. Existing reviews are immutable (no updates, no deletes allowed).

## The "Dirty Dozen" Malicious Payloads
1. **ID Impersonation** (User profile): An attacker trying to create or update profile `/users/alice` with `request.auth.uid = bob`.
2. **Key Theft**: An attacker trying to read `/users/alice/apiKeys/key1` with `request.auth.uid = bob`.
3. **Ghost Fields injection**: A user adding an unapproved key/property like `isGlobalAdmin = true` on their API Key document.
4. **Self-Elevating User Role**: A user trying to set custom claims or `role = 'admin'` at create time.
5. **Review Modification**: A user attempting to update or delete someone else's review.
6. **Self-assigned Scans Count**: A user attempting to set an astronomical number of free scans on their user profile without performing actual transactions.
7. **Junk Characters ID poisoning**: Requesting to save an API Key with a 1MB string or high junk-character sequences as the document ID.
8. **Invalid Rating Bound**: Submitting a review with rating = 15 (max 5).
9. **No Auth Scans Update**: Trying to decrement scan limit or increment scans count while unauthenticated.
10. **Tampering Key Status**: Revoking another developer's API key.
11. **Spoofed Auth Email Verification**: Bypassing mail safety by asserting unverified emails.
12. **Null-value Poisoning**: Supplying nulls or incorrect types for critical non-nullable fields.

## Rules Verification Test Runner Spec
A standard rules test suite verifies that all malicious write operations result in `PERMISSION_DENIED` while valid actions succeed.
