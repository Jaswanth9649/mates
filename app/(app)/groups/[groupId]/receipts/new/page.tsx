import { notFound } from "next/navigation";

import { ReceiptUploader } from "@/components/receipts/receipt-uploader";
import { getGroup, getGroupMembers } from "@/lib/mock-data";

export default async function NewReceiptPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const group = getGroup(groupId);
  if (!group) notFound();

  const members = getGroupMembers(groupId);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Scan receipt
      </h1>
      <ReceiptUploader groupId={groupId} members={members} />
    </div>
  );
}
