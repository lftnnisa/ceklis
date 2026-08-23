"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { categories } from "@/lib/db/schema";
import { requireUserId } from "@/lib/db/rls";
import { categorySchema } from "@/lib/validations";

export async function createCategory(input: {
  name: string;
  color: string;
  icon: string;
}) {
  const userId = await requireUserId();
  const parsed = categorySchema.parse(input);

  await db.insert(categories).values({
    userId,
    name: parsed.name,
    color: parsed.color,
    icon: parsed.icon,
    isPreset: false,
  });

  revalidatePath("/settings/categories");
}

export async function updateCategory(
  categoryId: string,
  input: { name: string; color: string; icon: string },
) {
  const userId = await requireUserId();
  const parsed = categorySchema.parse(input);

  await db
    .update(categories)
    .set({ name: parsed.name, color: parsed.color, icon: parsed.icon })
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));

  revalidatePath("/settings/categories");
}

export async function deleteCategory(categoryId: string) {
  const userId = await requireUserId();
  await db
    .delete(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));

  revalidatePath("/settings/categories");
}
