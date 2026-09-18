"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Wraps the Clerk <SignIn>/<SignUp> widget and watches whether it actually
 * renders anything.
 *
 * Two things this covers, both otherwise invisible to the user:
 *  1. The ~1-2s gap before Clerk's JS finishes booting and the widget
 *     mounts — previously just blank space. A skeleton approximating the
 *     widget's shape overlays that gap so the page doesn't flash empty.
 *     The real widget still mounts underneath (kept at real layout size via
 *     `invisible`, not `hidden`, so Clerk's own layout math isn't thrown
 *     off by measuring a collapsed container) and simply becomes visible
 *     the moment it's ready.
 *  2. On a Clerk *development* instance (no custom domain yet), the
 *     widget's cross-domain "dev browser" handshake can occasionally
 *     never resolve on browsers that block third-party cookies by default
 *     (confirmed via testing: WebKit — Safari and every iOS browser — hung
 *     with no console error on one run out of several). Past ~6s with
 *     nothing rendered, the skeleton is replaced with an explicit message
 *     and a reload button instead of staying blank forever.
 *
 * Keeps polling via MutationObserver so the moment the real widget mounts,
 * both the skeleton and the stall message disappear on their own.
 */
export function AuthWidgetStallGuard({ children }: { children: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [stalled, setStalled] = React.useState(false);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const check = () => {
      const hasLoaded = !!el.querySelector("input, button, iframe");
      if (hasLoaded) {
        setLoaded(true);
        setStalled(false);
      }
      return hasLoaded;
    };

    if (check()) return;

    const observer = new MutationObserver(() => {
      if (check()) observer.disconnect();
    });
    observer.observe(el, { childList: true, subtree: true });

    const timer = setTimeout(() => {
      if (!check()) setStalled(true);
    }, 6000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="relative w-full">
        <div ref={containerRef} className={loaded ? undefined : "invisible"}>
          {children}
        </div>
        {!loaded && (
          <div
            className="absolute inset-0 flex w-full flex-col gap-4 rounded-xl border border-border bg-card p-6"
            aria-hidden
          >
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-9 w-full rounded-lg" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-3 w-4" />
              <Skeleton className="h-px flex-1" />
            </div>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        )}
      </div>

      {stalled && (
        <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-background p-5 text-center">
          <p className="text-sm font-medium">Sign-in is stuck loading</p>
          <p className="text-xs text-muted-foreground">
            This is a known issue on Safari and iOS with this app&apos;s
            current setup (no custom domain yet). Try Chrome or Firefox on
            this device, or reload after allowing cross-site tracking for
            this site in your browser&apos;s privacy settings.
          </p>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      )}
    </div>
  );
}
