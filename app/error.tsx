"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-7 text-destructive" />
      </div>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Give it another try — if it keeps happening, refresh the page.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-muted-foreground">Error ref: {error.digest}</p>
        )}
      </div>
      <Button size="sm" onClick={() => retry()}>
        Try again
      </Button>
    </div>
  );
}
