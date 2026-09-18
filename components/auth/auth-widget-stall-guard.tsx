"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

/**
 * Wraps the Clerk <SignIn>/<SignUp> widget and watches whether it actually
 * renders anything. On a Clerk *development* instance (no custom domain
 * yet — see the sign-in/sign-up pages), the widget's cross-domain "dev
 * browser" handshake can silently never resolve on browsers that block
 * third-party cookies by default (confirmed via testing: WebKit — i.e.
 * Safari and every iOS browser — never mounts the widget at all, with no
 * console error). Without this, those users just see a blank card with no
 * indication of what's wrong. Keeps polling via MutationObserver so if the
 * widget does eventually load, the fallback disappears automatically.
 */
export function AuthWidgetStallGuard({ children }: { children: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [stalled, setStalled] = React.useState(false);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const hasLoaded = () => !!el.querySelector("input, button, iframe");

    const check = () => {
      const loaded = hasLoaded();
      if (loaded) setStalled(false);
      return loaded;
    };

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
    <>
      <div ref={containerRef}>{children}</div>
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
    </>
  );
}
