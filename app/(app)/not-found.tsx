import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

// Renders inside the authenticated AppShell (sidebar/header stay put) for
// notFound() calls thrown by pages under this segment — e.g. a bad groupId,
// or a group the current user isn't a member of.
export default function AppNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <SearchX className="size-7 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          That group or item doesn&apos;t exist, or you don&apos;t have access to it.
        </p>
      </div>
      <Button render={<Link href="/dashboard" />} nativeButton={false} size="sm" variant="outline">
        Back to dashboard
      </Button>
    </div>
  );
}
