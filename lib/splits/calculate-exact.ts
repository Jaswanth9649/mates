/**
 * Exact-amount splits have no arithmetic to perform — the caller supplies
 * each participant's amount directly. This just verifies they sum to the
 * expense total, which every write path must check server-side before
 * trusting client-submitted split amounts.
 */
export function exactSplitSumsToTotal(
  totalCents: number,
  splits: { amountCents: number }[]
): boolean {
  return splits.reduce((sum, s) => sum + s.amountCents, 0) === totalCents;
}
