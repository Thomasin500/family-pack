"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/app/actions";
import { cn } from "@/lib/utils";
import { LogOut, Sun, Moon } from "lucide-react";
import { useWeightUnit } from "@/components/providers/weight-unit-provider";

interface NavBarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navLinks = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/closet", label: "Closet" },
  { href: "/app/trips", label: "Trips" },
];

export function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();
  const { unit, toggle } = useWeightUnit();
  const [dark, setDark] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/app" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-primary-container">
              Family Pack
            </span>
          </Link>

          <nav className="hidden items-center gap-6 sm:flex">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/app" ? pathname === "/app" : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium tracking-tight transition-colors",
                    isActive
                      ? "font-bold text-primary border-b-2 border-primary-container pb-1"
                      : "text-outline hover:text-primary"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Weight unit cycle toggle */}
          <button
            onClick={toggle}
            className="rounded-full bg-surface-high px-3 py-1 text-xs font-bold uppercase tracking-wider text-outline hover:text-foreground hover:bg-surface-highest transition-all"
            title="Click to cycle: oz → lb → g → kg"
          >
            {unit}
          </button>

          {/* Dark / Light toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDark}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="size-8 text-outline hover:text-foreground"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <Link href="/app/trips">
            <Button
              size="sm"
              className="bg-gradient-to-br from-primary-container to-primary text-on-primary-container font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all"
            >
              New Trip
            </Button>
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            <Avatar className="size-8 border border-outline-variant">
              {user.image ? <AvatarImage src={user.image} alt={user.name ?? ""} /> : null}
              <AvatarFallback className="text-xs bg-surface-high text-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <form action={signOutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-outline hover:text-foreground"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
