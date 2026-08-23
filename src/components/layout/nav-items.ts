import type { LucideIcon } from "lucide-react";
import {
  BookHeart,
  CalendarDays,
  ListChecks,
  LineChart,
  Settings,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Hari ini", icon: ListChecks },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/journal", label: "Journal", icon: BookHeart },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/settings/categories", label: "Kategori", icon: Settings },
];
