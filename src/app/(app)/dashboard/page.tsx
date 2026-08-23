import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { habitLogs, habits, todos } from "@/lib/db/schema";
import { requireUserId } from "@/lib/db/rls";
import { getCategories } from "@/lib/categories";
import { todayIso } from "@/lib/streaks";
import { TodoList } from "@/components/todo/todo-list";
import { TodoQuickAdd } from "@/components/todo/todo-quick-add";
import { HabitList } from "@/components/habit/habit-list";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const categories = await getCategories(userId);
  const today = todayIso();

  const pendingTodos = await db
    .select()
    .from(todos)
    .where(
      and(
        eq(todos.userId, userId),
        eq(todos.status, "pending"),
        or(isNull(todos.dueDate), eq(todos.dueDate, today)),
      ),
    )
    .orderBy(todos.createdAt);

  const activeHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.archived, false)))
    .orderBy(habits.createdAt);

  const todaysLogs = await db
    .select({ habitId: habitLogs.habitId, status: habitLogs.status })
    .from(habitLogs)
    .where(and(eq(habitLogs.userId, userId), eq(habitLogs.date, today)));

  const loggedById = new Map(todaysLogs.map((l) => [l.habitId, l.status]));
  const habitsWithStatus = activeHabits.map((h) => ({
    id: h.id,
    name: h.name,
    categoryId: h.categoryId,
    currentStreak: h.currentStreak,
    loggedToday: loggedById.get(h.id) ?? null,
  }));

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hari ini</h1>
        <p className="text-sm text-muted-foreground">
          Swipe kanan buat selesai, kiri buat skip.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Habit</h2>
        <HabitList habits={habitsWithStatus} categories={categories} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Todo</h2>
        <TodoQuickAdd categories={categories} />
        <TodoList todos={pendingTodos} categories={categories} />
      </section>
    </div>
  );
}
