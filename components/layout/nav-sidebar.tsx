"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users2, UserRound, Receipt } from "lucide-react";

import { cn } from "@/lib/utils";
import { GROUPS } from "@/lib/mock-data";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/groups", label: "Groups", icon: Users2 },
  { href: "/friends", label: "Friends", icon: UserRound },
];

export function NavSidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6">
      <Link href="/dashboard" className="flex items-center gap-2 px-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
          <Receipt className="size-4" />
        </div>
        <span className="font-heading bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
          MATES
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1">
        <div className="px-3 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/50">
          Your groups
        </div>
        {GROUPS.map((group) => {
          const href = `/groups/${group.id}`;
          const active = pathname.startsWith(href);
          return (
            <Link
              key={group.id}
              href={href}
              className={cn(
                "truncate rounded-md px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {group.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
