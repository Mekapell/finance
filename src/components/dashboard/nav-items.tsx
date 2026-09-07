import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, ArrowLeftRight, BarChart3, Settings } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/transactions", label: "รายการ", icon: ArrowLeftRight },
  { href: "/reports", label: "รายงาน", icon: BarChart3 },
  { href: "/settings/profile", label: "ตั้งค่า", icon: Settings },
];
