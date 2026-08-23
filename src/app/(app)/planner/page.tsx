import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { requireUserId } from "@/lib/db/rls";
import { getActivityByDate } from "@/lib/planner";
import { Button } from "@/components/ui/button";
import { MonthGrid, formatMonthLabel } from "@/components/planner/month-grid";

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const userId = await requireUserId();
  const { month } = await searchParams;

  const monthDate = month ? new Date(`${month}-01T00:00:00`) : new Date();
  const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });

  const activityByDate = await getActivityByDate(
    userId,
    format(gridStart, "yyyy-MM-dd"),
    format(gridEnd, "yyyy-MM-dd"),
  );

  const prevMonth = format(subMonths(monthDate, 1), "yyyy-MM");
  const nextMonth = format(addMonths(monthDate, 1), "yyyy-MM");

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planner</h1>
          <Link
            href="/planner/year"
            className="text-xs text-muted-foreground underline underline-offset-2"
          >
            Lihat per tahun
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/planner?month=${prevMonth}`}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <span className="w-32 text-center text-sm font-medium capitalize">
            {formatMonthLabel(monthDate)}
          </span>
          <Button asChild variant="ghost" size="icon">
            <Link href={`/planner?month=${nextMonth}`}>
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <MonthGrid monthDate={monthDate} activityByDate={activityByDate} />

      <p className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-orange-500" /> Habit
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-blue-500" /> Todo
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-purple-500" /> Journal
        </span>
      </p>
    </div>
  );
}
