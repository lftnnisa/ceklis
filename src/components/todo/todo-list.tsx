"use client";

import { toast } from "sonner";
import { SwipeableItem } from "@/components/swipe/swipeable-item";
import { Badge } from "@/components/ui/badge";
import { completeTodo, skipTodo, undoTodo } from "@/app/(app)/dashboard/actions";

type Category = { id: string; name: string; color: string };

type Todo = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  categoryId: string | null;
};

export function TodoList({
  todos,
  categories,
}: {
  todos: Todo[];
  categories: Category[];
}) {
  if (todos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Belum ada tugas. Tambah satu di atas.
      </p>
    );
  }

  async function handleComplete(id: string, title: string) {
    await completeTodo(id);
    toast.success(`"${title}" selesai`, {
      action: { label: "Undo", onClick: () => undoTodo(id) },
    });
  }

  async function handleSkip(id: string, title: string) {
    await skipTodo(id);
    toast(`"${title}" di-skip`, {
      action: { label: "Undo", onClick: () => undoTodo(id) },
    });
  }

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => {
        const category = categories.find((c) => c.id === todo.categoryId);
        return (
          <li key={todo.id}>
            <SwipeableItem
              onSwipeRight={() => handleComplete(todo.id, todo.title)}
              onSwipeLeft={() => handleSkip(todo.id, todo.title)}
              className="border"
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{todo.title}</p>
                  {todo.description ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {todo.description}
                    </p>
                  ) : null}
                </div>
                {category ? (
                  <Badge
                    style={{ backgroundColor: `${category.color}22`, color: category.color }}
                    className="shrink-0 border-0"
                  >
                    {category.name}
                  </Badge>
                ) : null}
              </div>
            </SwipeableItem>
          </li>
        );
      })}
    </ul>
  );
}
