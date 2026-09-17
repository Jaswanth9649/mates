import { BalanceSummary } from "@/components/balances/balance-summary";
import { CURRENT_USER_ID, computeBalances } from "@/lib/mock-data";

export default function FriendsPage() {
  const balances = computeBalances({ forUserId: CURRENT_USER_ID });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Friends</h1>
        <p className="text-sm text-muted-foreground">
          Your balance with each person, combined across every shared group.
        </p>
      </div>

      <BalanceSummary
        items={balances}
        settleHref={(counterpartId) => `/friends/${counterpartId}`}
      />
    </div>
  );
}
