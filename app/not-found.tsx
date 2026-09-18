import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Compass className="size-7 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          That page doesn&apos;t exist, or it may have moved.
        </p>
      </div>
      <Button render={<Link href="/dashboard" />} nativeButton={false} size="sm">
        Back to dashboard
      </Button>
    </div>
  );
}
