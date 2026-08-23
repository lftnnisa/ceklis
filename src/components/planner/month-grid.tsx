import Link from "next/link";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DayActivity } from "@/lib/planner";

const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function MonthGrid({
  monthDate,
  activityByDate,
}: {
  monthDate: Date;
  activityByDate: Map<string, DayActivity>;
}) {
  const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });

  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
    days.push(d);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const iso = format(day, "yyyy-MM-dd");
          const activity = activityByDate.get(iso);
          const inMonth = isSameMonth(day, monthDate);
          const hasActivity =
            activity &&
            (activity.todoCount > 0 ||
              activity.habitDoneCount > 0 ||
              activity.hasJournal);

          return (
            <Link
              key={iso}
              href={`/planner/day?date=${iso}`}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-sm transition-colors",
                inMonth ? "text-foreground" : "text-muted-foreground/40",
                isToday(day) && "bg-primary/10 font-semibold text-primary",
                "hover:bg-muted",
              )}
            >
              {format(day, "d")}
              {hasActivity ? (
                <span className="flex gap-0.5">
                  {activity!.habitDoneCount > 0 ? (
                    <span className="size-1 rounded-full bg-orange-500" />
                  ) : null}
                  {activity!.todoCount > 0 ? (
                    <span className="size-1 rounded-full bg-blue-500" />
                  ) : null}
                  {activity!.hasJournal ? (
                    <span className="size-1 rounded-full bg-purple-500" />
                  ) : null}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function formatMonthLabel(date: Date) {
  return format(date, "MMMM yyyy", { locale: id });
}
