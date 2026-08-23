"use client";

import { toast } from "sonner";
import { Flame, Snowflake } from "lucide-react";
import { SwipeableItem } from "@/components/swipe/swipeable-item";
import { Badge } from "@/components/ui/badge";
import {
  logHabitDone,
  logHabitSkip,
  undoHabitLog,
} from "@/app/(app)/habits/actions";

type Category = { id: string; name: string; color: string };

type Habit = {
  id: string;
  name: string;
  categoryId: string | null;
  currentStreak: number;
  loggedToday: "done" | "skipped" | "frozen" | null;
};

export function HabitList({
  habits,
  categories,
}: {
  habits: Habit[];
  categories: Category[];
}) {
  const pending = habits.filter((h) => h.loggedToday === null);

  if (pending.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Semua habit hari ini udah diisi. Mantap!
      </p>
    );
  }

  async function handleDone(id: string, name: string) {
    await logHabitDone(id);
    toast.success(`"${name}" selesai`, {
      action: { label: "Undo", onClick: () => undoHabitLog(id) },
    });
  }

  async function handleSkip(id: string, name: string) {
    const status = await logHabitSkip(id);
    toast(
      status === "frozen"
        ? `"${name}" di-freeze — streak aman`
        : `"${name}" di-skip — streak reset`,
      { action: { label: "Undo", onClick: () => undoHabitLog(id) } },
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {pending.map((habit) => {
        const category = categories.find((c) => c.id === habit.categoryId);
        return (
          <li key={habit.id}>
            <SwipeableItem
              onSwipeRight={() => handleDone(habit.id, habit.name)}
              onSwipeLeft={() => handleSkip(habit.id, habit.name)}
              className="border"
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{habit.name}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    {habit.currentStreak > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500">
                        <Flame className="size-3.5" />
                        {habit.currentStreak}
                      </span>
                    ) : null}
                    {category ? (
                      <Badge
                        style={{
                          backgroundColor: `${category.color}22`,
                          color: category.color,
                        }}
                        className="border-0"
                      >
                        {category.name}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <Snowflake className="size-4 shrink-0 text-muted-foreground" />
              </div>
            </SwipeableItem>
          </li>
        );
      })}
    </ul>
  );
}
