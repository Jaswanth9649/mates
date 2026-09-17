/**
 * Splits totalCents by percentage shares. Each share's cents are floored,
 * then any leftover cents (from rounding down) are distributed one-by-one to
 * the shares with the largest fractional remainder, so the split always sums
 * exactly to totalCents.
 */
export function splitByPercentage(
  totalCents: number,
  shares: { id: string; percent: number }[]
): Record<string, number> {
  const floors = shares.map((s) => {
    const exact = (totalCents * s.percent) / 100;
    return { id: s.id, floor: Math.floor(exact), frac: exact - Math.floor(exact) };
  });
  const allocated = floors.reduce((sum, f) => sum + f.floor, 0);
  const remainder = totalCents - allocated;
  const sortedByFrac = [...floors].sort((a, b) => b.frac - a.frac);

  const result: Record<string, number> = {};
  floors.forEach((f) => (result[f.id] = f.floor));
  for (let i = 0; i < remainder && sortedByFrac.length > 0; i++) {
    result[sortedByFrac[i % sortedByFrac.length].id] += 1;
  }
  return result;
}
