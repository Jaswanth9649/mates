"use client";

import * as React from "react";
import { UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReceiptReview } from "@/components/receipts/receipt-review";
import { RECEIPT_MOCK } from "@/lib/mock-data";
import type { Person } from "@/lib/mock-data";

export function ReceiptUploader({
  groupId,
  members,
  currency = "USD",
  defaultPaidBy,
}: {
  groupId: string;
  members: Person[];
  currency?: string;
  defaultPaidBy: string;
}) {
  const [status, setStatus] = React.useState<"idle" | "processing" | "review">(
    "idle"
  );

  const handleUpload = () => {
    setStatus("processing");
    // Simulated OCR round-trip. Phase 4 replaces this with a real Vercel Blob
    // upload + Mindee/Taggun call, polling GET /api/receipts/[receiptId].
    setTimeout(() => setStatus("review"), 1400);
  };

  if (status === "review") {
    return (
      <ReceiptReview
        groupId={groupId}
        members={members}
        currency={currency}
        defaultPaidBy={defaultPaidBy}
        merchantName={RECEIPT_MOCK.merchantName}
        totalAmountCents={RECEIPT_MOCK.totalAmountCents}
        overallConfidence={RECEIPT_MOCK.confidence}
        initialLineItems={RECEIPT_MOCK.lineItems}
      />
    );
  }

  if (status === "processing") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
          <p className="text-sm text-muted-foreground">Reading your receipt…</p>
        </div>
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <UploadCloud className="size-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">Upload a photo of your receipt</p>
        <p className="text-xs text-muted-foreground">
          We&apos;ll extract the merchant, total, and line items automatically.
        </p>
      </div>
      <Button onClick={handleUpload}>Use sample receipt</Button>
      <p className="text-xs text-muted-foreground">
        (Real upload wires up to Vercel Blob + OCR in Phase 4 — this uses a
        sample receipt for now.)
      </p>
    </div>
  );
}
