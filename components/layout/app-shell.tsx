"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Plus, LogOut, Settings, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavSidebarContent } from "@/components/layout/nav-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { initials } from "@/lib/format";
import { CURRENT_USER_ID, PEOPLE } from "@/lib/mock-data";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const currentUser = PEOPLE.find((p) => p.id === CURRENT_USER_ID)!;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar px-3 py-4 md:flex">
        <NavSidebarContent />
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar p-3">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <NavSidebarContent />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>

          <div className="flex-1" />

          <Button render={<Link href="/groups" />} nativeButton={false} size="sm">
            <Plus className="size-4" />
            Add expense
          </Button>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Account menu"
                />
              }
            >
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">
                  {initials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{currentUser.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {currentUser.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <User className="size-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Settings className="size-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <LogOut className="size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
