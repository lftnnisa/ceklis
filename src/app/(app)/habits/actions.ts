"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { habitLogs, habits } from "@/lib/db/schema";
import { requireUserId } from "@/lib/db/rls";
import { habitSchema } from "@/lib/validations";
import { freezesUsedThisMonth, recomputeStreak, todayIso } from "@/lib/streaks";

export async function createHabit(input: {
  name: string;
  categoryId?: string | null;
  frequency: "daily" | "weekly";
  targetPerPeriod: number;
  freezeAllowancePerMonth: number;
}) {
  const userId = await requireUserId();
  const parsed = habitSchema.parse(input);

  await db.insert(habits).values({
    userId,
    name: parsed.name,
    categoryId: parsed.categoryId || null,
    frequency: parsed.frequency,
    targetPerPeriod: parsed.targetPerPeriod,
    freezeAllowancePerMonth: parsed.freezeAllowancePerMonth,
  });

  revalidatePath("/dashboard");
  revalidatePath("/habits");
}

export async function archiveHabit(habitId: string) {
  const userId = await requireUserId();
  await db
    .update(habits)
    .set({ archived: true })
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)));

  revalidatePath("/dashboard");
  revalidatePath("/habits");
}

async function assertOwnsHabit(habitId: string, userId: string) {
  const [habit] = await db
    .select({ id: habits.id })
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);
  if (!habit) throw new Error("Habit not found");
}

export async function logHabitDone(habitId: string) {
  const userId = await requireUserId();
  await assertOwnsHabit(habitId, userId);

  await db
    .insert(habitLogs)
    .values({ userId, habitId, date: todayIso(), status: "done" })
    .onConflictDoUpdate({
      target: [habitLogs.habitId, habitLogs.date],
      set: { status: "done" },
    });

  await recomputeStreak(habitId);
  revalidatePath("/dashboard");
  revalidatePath("/habits");
}

export async function logHabitSkip(habitId: string) {
  const userId = await requireUserId();
  await assertOwnsHabit(habitId, userId);

  const [habit] = await db
    .select({ freezeAllowancePerMonth: habits.freezeAllowancePerMonth })
    .from(habits)
    .where(eq(habits.id, habitId))
    .limit(1);

  const used = await freezesUsedThisMonth(habitId);
  const status = habit && used < habit.freezeAllowancePerMonth ? "frozen" : "skipped";

  await db
    .insert(habitLogs)
    .values({ userId, habitId, date: todayIso(), status })
    .onConflictDoUpdate({
      target: [habitLogs.habitId, habitLogs.date],
      set: { status },
    });

  await recomputeStreak(habitId);
  revalidatePath("/dashboard");
  revalidatePath("/habits");

  return status;
}

export async function undoHabitLog(habitId: string) {
  const userId = await requireUserId();
  await assertOwnsHabit(habitId, userId);

  await db
    .delete(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, todayIso())));

  await recomputeStreak(habitId);
  revalidatePath("/dashboard");
  revalidatePath("/habits");
}
