import { BalanceSummary } from "@/components/balances/balance-summary";

export default function FriendsPage() {
  // Cross-group balance aggregation depends on the expense system (Phase 2)
  // and dedicated Friends aggregation (Phase 3) — until then this is
  // correctly empty rather than showing fabricated relationships.
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Friends</h1>
        <p className="text-sm text-muted-foreground">
          Your balance with each person, combined across every shared group.
        </p>
      </div>

      <BalanceSummary items={[]} />
    </div>
  );
}
