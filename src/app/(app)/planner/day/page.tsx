import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, format, subDays } from "date-fns";
import { id } from "date-fns/locale";
import { db } from "@/lib/db/client";
import { habitLogs, habits, journalEntries, todos } from "@/lib/db/schema";
import { requireUserId } from "@/lib/db/rls";
import { todayIso } from "@/lib/streaks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function PlannerDayPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const userId = await requireUserId();
  const { date } = await searchParams;
  const iso = date || todayIso();
  const dayDate = new Date(`${iso}T00:00:00`);

  const [dayTodos, dayHabitLogs, dayJournal] = await Promise.all([
    db
      .select()
      .from(todos)
      .where(and(eq(todos.userId, userId), eq(todos.dueDate, iso))),
    db
      .select({
        status: habitLogs.status,
        habitName: habits.name,
      })
      .from(habitLogs)
      .innerJoin(habits, eq(habitLogs.habitId, habits.id))
      .where(and(eq(habitLogs.userId, userId), eq(habitLogs.date, iso))),
    db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), eq(journalEntries.date, iso)))
      .limit(1),
  ]);

  const prevIso = format(subDays(dayDate, 1), "yyyy-MM-dd");
  const nextIso = format(addDays(dayDate, 1), "yyyy-MM-dd");

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/planner/day?date=${prevIso}`}>
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div className="text-center">
          <h1 className="text-lg font-bold capitalize">
            {format(dayDate, "EEEE, d MMMM yyyy", { locale: id })}
          </h1>
        </div>
        <Button asChild variant="ghost" size="icon">
          <Link href={`/planner/day?date=${nextIso}`}>
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Habit</h2>
        {dayHabitLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada catatan habit.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {dayHabitLogs.map((h, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                {h.habitName}
                <Badge variant={h.status === "done" ? "default" : "secondary"}>
                  {h.status === "done" ? "Selesai" : h.status === "frozen" ? "Freeze" : "Skip"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Todo</h2>
        {dayTodos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Gak ada tugas di tanggal ini.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {dayTodos.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                {t.title}
                <Badge variant={t.status === "done" ? "default" : "secondary"}>
                  {t.status === "done" ? "Selesai" : t.status === "skipped" ? "Skip" : "Pending"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Journal</h2>
        {dayJournal.length === 0 ? (
          <Link
            href={`/journal?date=${iso}`}
            className="text-sm text-primary underline underline-offset-2"
          >
            Tulis journal buat hari ini
          </Link>
        ) : (
          <Link
            href={`/journal?date=${iso}`}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
          >
            {dayJournal[0].title || "Ada entry journal — buka"}
          </Link>
        )}
      </section>
    </div>
  );
}
