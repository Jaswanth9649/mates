/**
 * Splits totalCents equally among memberIds. Any remainder cent (from
 * integer division) is assigned one-by-one to the first N members in array
 * order, so the split always sums exactly to totalCents.
 */
export function splitEqually(
  totalCents: number,
  memberIds: string[]
): Record<string, number> {
  const n = memberIds.length;
  if (n === 0) return {};
  const base = Math.floor(totalCents / n);
  const remainder = totalCents - base * n;
  const result: Record<string, number> = {};
  memberIds.forEach((id, i) => {
    result[id] = base + (i < remainder ? 1 : 0);
  });
  return result;
}
