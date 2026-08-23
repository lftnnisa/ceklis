import {
  Baby,
  Bike,
  BookOpen,
  Briefcase,
  Brush,
  Coffee,
  Dumbbell,
  Gamepad2,
  HeartPulse,
  Home,
  type LucideIcon,
  Music,
  PawPrint,
  Plane,
  Salad,
  Smile,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  HeartPulse,
  Briefcase,
  BookOpen,
  Smile,
  Wallet,
  Dumbbell,
  Salad,
  Home,
  Users,
  Baby,
  PawPrint,
  Music,
  Brush,
  Gamepad2,
  Plane,
  Coffee,
  Bike,
  Sparkles,
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS);

export const CATEGORY_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#f59e0b",
  "#14b8a6",
  "#ec4899",
  "#ef4444",
  "#6366f1",
];

export function CategoryIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[icon] ?? Sparkles;
  return <Icon className={className} />;
}
