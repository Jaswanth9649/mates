import { NextResponse } from "next/server";

import { getDueRecurringExpenses, materializeRecurringExpense } from "@/lib/db/queries/recurring";
import { isDueByUTC } from "@/lib/recurring/next-run";

/**
 * Runs daily (see vercel.json `crons`) to turn every due recurring
 * schedule into a real expense. Vercel signs cron requests with
 * `Authorization: Bearer $CRON_SECRET` — this must match the CRON_SECRET
 * env var set in the Vercel project, or the request is rejected. This
 * route lives outside app/(app), so Clerk's page-level auth never sees it;
 * this header check is the only gate.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayDateStr = new Date().toISOString().slice(0, 10);
  const due = await getDueRecurringExpenses(todayDateStr);

  const results = [];
  for (const recurring of due) {
    // Re-check per-item in case an occurrence lands exactly on the
    // boundary between when the list was fetched and now.
    if (!isDueByUTC(recurring.nextRunDate)) continue;
    const { expense, advancedDate } = await materializeRecurringExpense(recurring);
    results.push({ recurringId: recurring.id, expenseId: expense.id, nextRunDate: advancedDate });
  }

  return NextResponse.json({ processed: results.length, results });
}
