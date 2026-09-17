import { BalanceSummary } from "@/components/balances/balance-summary";
import { getCurrentUser } from "@/lib/auth/current-user";
import { computeAllBalancesForUser } from "@/lib/db/queries/balances";

export default async function FriendsPage() {
  const user = await getCurrentUser();
  const balances = user ? await computeAllBalancesForUser(user.id) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Friends</h1>
        <p className="text-sm text-muted-foreground">
          Your balance with each person, combined across every shared group.
        </p>
      </div>

      <BalanceSummary items={balances} />
    </div>
  );
}
