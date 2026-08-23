import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { todos } from "@/lib/db/schema";
import { requireUserId } from "@/lib/db/rls";
import { getCategories } from "@/lib/categories";
import { TodoList } from "@/components/todo/todo-list";
import { TodoQuickAdd } from "@/components/todo/todo-quick-add";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

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

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hari ini</h1>
        <p className="text-sm text-muted-foreground">
          Swipe kanan buat selesai, kiri buat skip.
        </p>
      </div>

      <TodoQuickAdd categories={categories} />
      <TodoList todos={pendingTodos} categories={categories} />
    </div>
  );
}
