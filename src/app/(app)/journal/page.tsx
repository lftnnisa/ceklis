import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { JSONContent } from "@tiptap/react";
import { db } from "@/lib/db/client";
import { journalEntries } from "@/lib/db/schema";
import { requireUserId } from "@/lib/db/rls";
import { todayIso } from "@/lib/streaks";
import { JournalEditor } from "@/components/journal/journal-editor";
import { cn } from "@/lib/utils";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const userId = await requireUserId();
  const { date } = await searchParams;
  const iso = date || todayIso();

  const [entryForDate, recentEntries] = await Promise.all([
    db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), eq(journalEntries.date, iso)))
      .limit(1),
    db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.date))
      .limit(30),
  ]);

  const current = entryForDate[0];

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
        <p className="text-sm text-muted-foreground capitalize">
          {format(new Date(`${iso}T00:00:00`), "EEEE, d MMMM yyyy", { locale: id })}
        </p>
      </div>

      <JournalEditor
        key={iso}
        date={iso}
        initialTitle={current?.title ?? undefined}
        initialContent={(current?.content as JSONContent) ?? undefined}
        initialMood={current?.mood ?? undefined}
      />

      {recentEntries.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Entry sebelumnya
          </h2>
          <ul className="flex flex-col gap-1.5">
            {recentEntries.map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/journal?date=${entry.date}`}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-muted",
                    entry.date === iso && "border-primary bg-primary/5",
                  )}
                >
                  <span className="truncate">
                    {entry.title || format(new Date(`${entry.date}T00:00:00`), "d MMM yyyy", { locale: id })}
                  </span>
                  <span className="shrink-0 text-base">{entry.mood}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
