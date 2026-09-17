// Client-safe split math shared by the expense form's live preview.
// Phase 2 will move this into lib/splits/{calculate-equal,calculate-percentage,rounding}.ts
// per the project plan, with unit tests for the rounding edge cases.

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

export function dollarsToCents(input: string): number {
  const n = Number.parseFloat(input);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}
