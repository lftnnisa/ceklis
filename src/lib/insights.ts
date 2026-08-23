import { and, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { categories, habitLogs, habits, todos } from "@/lib/db/schema";

const WEEKDAY_NAMES = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const LOOKBACK_DAYS = 30;
const MIN_SAMPLE_FOR_PATTERN = 3;

export type CategoryStat = {
  categoryId: string | null;
  name: string;
  color: string;
  done: number;
  skipped: number;
  rate: number;
};

export type Insights = {
  categoryStats: CategoryStat[];
  textInsights: string[];
  topStreakHabit: { name: string; streak: number } | null;
  mostSkippedHabit: { name: string; skips: number } | null;
};

function windowStartIso() {
  const d = new Date();
  d.setDate(d.getDate() - LOOKBACK_DAYS);
  return d.toISOString().slice(0, 10);
}

export async function computeInsights(userId: string): Promise<Insights> {
  const start = windowStartIso();

  const [userCategories, recentTodos, recentHabitLogs, userHabits] = await Promise.all([
    db.select().from(categories).where(eq(categories.userId, userId)),
    db
      .select({
        categoryId: todos.categoryId,
        status: todos.status,
        dueDate: todos.dueDate,
      })
      .from(todos)
      .where(and(eq(todos.userId, userId), gte(todos.dueDate, start))),
    db
      .select({
        status: habitLogs.status,
        date: habitLogs.date,
        categoryId: habits.categoryId,
        habitName: habits.name,
      })
      .from(habitLogs)
      .innerJoin(habits, eq(habitLogs.habitId, habits.id))
      .where(and(eq(habitLogs.userId, userId), gte(habitLogs.date, start))),
    db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.archived, false))),
  ]);

  const categoryById = new Map(userCategories.map((c) => [c.id, c]));

  // Completion rate per category (todos "done"/"skipped" + habit logs "done"/"skipped").
  const statsByCategory = new Map<string, CategoryStat>();
  function bump(categoryId: string | null, outcome: "done" | "skipped") {
    const key = categoryId ?? "__none__";
    let stat = statsByCategory.get(key);
    if (!stat) {
      const cat = categoryId ? categoryById.get(categoryId) : undefined;
      stat = {
        categoryId,
        name: cat?.name ?? "Tanpa kategori",
        color: cat?.color ?? "#94a3b8",
        done: 0,
        skipped: 0,
        rate: 0,
      };
      statsByCategory.set(key, stat);
    }
    if (outcome === "done") stat.done += 1;
    else stat.skipped += 1;
  }

  for (const t of recentTodos) {
    if (t.status === "done") bump(t.categoryId, "done");
    else if (t.status === "skipped") bump(t.categoryId, "skipped");
  }
  for (const l of recentHabitLogs) {
    if (l.status === "done") bump(l.categoryId, "done");
    else if (l.status === "skipped") bump(l.categoryId, "skipped");
  }

  const categoryStats = [...statsByCategory.values()]
    .map((s) => ({ ...s, rate: s.done + s.skipped > 0 ? s.done / (s.done + s.skipped) : 0 }))
    .sort((a, b) => b.done + b.skipped - (a.done + a.skipped));

  // Day-of-week skip pattern per category.
  const skipByCategoryWeekday = new Map<string, number>();
  function weekdayKey(categoryId: string | null, weekday: number) {
    return `${categoryId ?? "__none__"}:${weekday}`;
  }
  for (const t of recentTodos) {
    if (t.status !== "skipped" || !t.dueDate) continue;
    const weekday = new Date(`${t.dueDate}T00:00:00`).getDay();
    const key = weekdayKey(t.categoryId, weekday);
    skipByCategoryWeekday.set(key, (skipByCategoryWeekday.get(key) ?? 0) + 1);
  }
  for (const l of recentHabitLogs) {
    if (l.status !== "skipped") continue;
    const weekday = new Date(`${l.date}T00:00:00`).getDay();
    const key = weekdayKey(l.categoryId, weekday);
    skipByCategoryWeekday.set(key, (skipByCategoryWeekday.get(key) ?? 0) + 1);
  }

  const textInsights: string[] = [];
  let worstPattern: { categoryId: string | null; weekday: number; count: number } | null = null;
  for (const [key, count] of skipByCategoryWeekday) {
    if (count < MIN_SAMPLE_FOR_PATTERN) continue;
    if (!worstPattern || count > worstPattern.count) {
      const [catPart, weekdayPart] = key.split(":");
      worstPattern = {
        categoryId: catPart === "__none__" ? null : catPart,
        weekday: Number(weekdayPart),
        count,
      };
    }
  }
  if (worstPattern) {
    const catName = worstPattern.categoryId
      ? categoryById.get(worstPattern.categoryId)?.name ?? "kategori ini"
      : "tugas tanpa kategori";
    textInsights.push(
      `Kamu paling sering skip ${catName} di hari ${WEEKDAY_NAMES[worstPattern.weekday]} (${worstPattern.count}x dalam ${LOOKBACK_DAYS} hari terakhir).`,
    );
  }

  const bestCategory = categoryStats.find((s) => s.done + s.skipped >= MIN_SAMPLE_FOR_PATTERN && s.rate >= 0.8);
  if (bestCategory) {
    textInsights.push(
      `${bestCategory.name} jadi kategori paling konsisten kamu — completion rate ${Math.round(bestCategory.rate * 100)}%.`,
    );
  }

  const worstCategory = [...categoryStats]
    .filter((s) => s.done + s.skipped >= MIN_SAMPLE_FOR_PATTERN)
    .sort((a, b) => a.rate - b.rate)[0];
  if (worstCategory && worstCategory.rate < 0.5) {
    textInsights.push(
      `${worstCategory.name} butuh perhatian lebih — completion rate cuma ${Math.round(worstCategory.rate * 100)}%.`,
    );
  }

  const topStreakHabit = userHabits
    .filter((h) => h.currentStreak > 0)
    .sort((a, b) => b.currentStreak - a.currentStreak)[0];

  const skipsByHabit = new Map<string, number>();
  for (const l of recentHabitLogs) {
    if (l.status === "skipped") {
      skipsByHabit.set(l.habitName, (skipsByHabit.get(l.habitName) ?? 0) + 1);
    }
  }
  const mostSkippedEntry = [...skipsByHabit.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    categoryStats,
    textInsights,
    topStreakHabit: topStreakHabit
      ? { name: topStreakHabit.name, streak: topStreakHabit.currentStreak }
      : null,
    mostSkippedHabit: mostSkippedEntry
      ? { name: mostSkippedEntry[0], skips: mostSkippedEntry[1] }
      : null,
  };
}
