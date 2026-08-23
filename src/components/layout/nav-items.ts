import type { LucideIcon } from "lucide-react";
import {
  BookHeart,
  CalendarDays,
  Flame,
  ListChecks,
  LineChart,
  Settings,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Hari ini", icon: ListChecks, mobile: true },
  { href: "/habits", label: "Habit", icon: Flame, mobile: true },
  { href: "/planner", label: "Planner", icon: CalendarDays, mobile: true },
  { href: "/journal", label: "Journal", icon: BookHeart, mobile: true },
  { href: "/progress", label: "Progress", icon: LineChart, mobile: true },
  { href: "/settings/categories", label: "Kategori", icon: Settings },
];
