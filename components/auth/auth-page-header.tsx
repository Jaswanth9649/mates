/**
 * Shared header for the sign-in/sign-up pages. Matches the app's real
 * branding (the neutral dark/light square from app/icon.tsx) instead of
 * the emerald/teal gradient these pages used to have — a leftover from the
 * Phase 0 UI mockup that never got reconciled with the app's actual
 * neutral black/white theme (every primary button elsewhere is bg-primary,
 * not emerald).
 */
export function AuthPageHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <span className="text-base font-bold">M</span>
      </div>
      <h1 className="text-xl font-semibold tracking-tight">{children}</h1>
    </div>
  );
}
