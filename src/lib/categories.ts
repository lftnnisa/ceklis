import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { categories } from "@/lib/db/schema";

export const PRESET_CATEGORIES = [
  { name: "Kesehatan", color: "#22c55e", icon: "HeartPulse" },
  { name: "Kerja", color: "#3b82f6", icon: "Briefcase" },
  { name: "Belajar", color: "#a855f7", icon: "BookOpen" },
  { name: "Pribadi", color: "#f59e0b", icon: "Smile" },
  { name: "Keuangan", color: "#14b8a6", icon: "Wallet" },
] as const;

/** Seeds preset categories for a user on first touch. Cheap no-op after. */
export async function ensurePresetCategories(userId: string) {
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.isPreset, true)))
    .limit(1);

  if (existing.length > 0) return;

  await db.insert(categories).values(
    PRESET_CATEGORIES.map((c) => ({
      userId,
      name: c.name,
      color: c.color,
      icon: c.icon,
      isPreset: true,
    })),
  );
}

export async function getCategories(userId: string) {
  await ensurePresetCategories(userId);
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.createdAt);
}
