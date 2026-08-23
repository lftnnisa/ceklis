"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { todos } from "@/lib/db/schema";
import { requireUserId } from "@/lib/db/rls";
import { todoSchema } from "@/lib/validations";

export async function createTodo(input: {
  title: string;
  description?: string;
  categoryId?: string | null;
  dueDate?: string | null;
}) {
  const userId = await requireUserId();
  const parsed = todoSchema.parse(input);

  await db.insert(todos).values({
    userId,
    title: parsed.title,
    description: parsed.description || null,
    categoryId: parsed.categoryId || null,
    dueDate: parsed.dueDate || null,
  });

  revalidatePath("/dashboard");
}

async function setTodoStatus(todoId: string, status: "done" | "skipped" | "pending") {
  const userId = await requireUserId();

  await db
    .update(todos)
    .set({
      status,
      completedAt: status === "done" ? new Date() : null,
    })
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)));

  revalidatePath("/dashboard");
}

export async function completeTodo(todoId: string) {
  await setTodoStatus(todoId, "done");
}

export async function skipTodo(todoId: string) {
  await setTodoStatus(todoId, "skipped");
}

export async function undoTodo(todoId: string) {
  await setTodoStatus(todoId, "pending");
}

export async function deleteTodo(todoId: string) {
  const userId = await requireUserId();
  await db
    .delete(todos)
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)));
  revalidatePath("/dashboard");
}
