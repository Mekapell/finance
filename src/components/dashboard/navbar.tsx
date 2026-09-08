"use client";

import Link from "next/link";
import { LogOut, Settings, Wallet } from "lucide-react";

import { logout } from "@/app/(dashboard)/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProfileWithShop } from "@/lib/data/profile";

export function Navbar({ profile }: { profile: ProfileWithShop }) {
  const initial = (profile.ownerName || profile.shopName || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wallet className="size-4" />
        </div>
        <span className="truncate font-semibold">{profile.shopName}</span>
      </div>

      <div className="hidden md:block" />

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar>
            <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.shopName} />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate">{profile.shopName}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {profile.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings/profile">
              <Settings />
              ตั้งค่าโปรไฟล์
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={logout}>
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full text-destructive focus:text-destructive">
                <LogOut />
                ออกจากระบบ
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
