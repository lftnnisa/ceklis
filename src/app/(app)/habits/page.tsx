import { and, eq } from "drizzle-orm";
import { Flame, Trophy } from "lucide-react";
import { db } from "@/lib/db/client";
import { habits } from "@/lib/db/schema";
import { requireUserId } from "@/lib/db/rls";
import { getCategories } from "@/lib/categories";
import { HabitQuickAdd } from "@/components/habit/habit-quick-add";
import { Badge } from "@/components/ui/badge";

export default async function HabitsPage() {
  const userId = await requireUserId();
  const categories = await getCategories(userId);

  const allHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.archived, false)))
    .orderBy(habits.createdAt);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Habit</h1>
        <p className="text-sm text-muted-foreground">
          Semua kebiasaan yang kamu lacak.
        </p>
      </div>

      <HabitQuickAdd categories={categories} />

      {allHabits.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Belum ada habit. Tambah satu di atas.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {allHabits.map((habit) => {
            const category = categories.find((c) => c.id === habit.categoryId);
            return (
              <li
                key={habit.id}
                className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{habit.name}</p>
                  {category ? (
                    <Badge
                      style={{
                        backgroundColor: `${category.color}22`,
                        color: category.color,
                      }}
                      className="mt-1 border-0"
                    >
                      {category.name}
                    </Badge>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-semibold text-orange-500">
                    <Flame className="size-3.5" />
                    {habit.currentStreak}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Trophy className="size-3.5" />
                    {habit.longestStreak}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
