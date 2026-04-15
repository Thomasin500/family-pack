"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/app/actions";
import { cn } from "@/lib/utils";
import { LogOut, Scale } from "lucide-react";
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
  { href: "/app/settings", label: "Settings" },
];

export function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();
  const { unit, toggle } = useWeightUnit();

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/app" className="flex items-center gap-2">
            <Image
              src="/logo.webp"
              alt="Family Pack"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-semibold tracking-tight">
              Family Pack
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/app"
                  ? pathname === "/app"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="gap-1.5 font-mono text-xs tabular-nums"
            title="Toggle weight units"
          >
            <Scale className="size-3.5" />
            {unit === "imperial" ? "oz/lb" : "g/kg"}
          </Button>

          <div className="hidden items-center gap-2 sm:flex">
            <Avatar className="size-7">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name ?? ""} />
              ) : null}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="max-w-[120px] truncate text-sm text-muted-foreground">
              {user.name}
            </span>
          </div>

          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm" className="gap-1.5">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
