import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { requireUserId } from "@/lib/db/rls";
import { getActivityByDate } from "@/lib/planner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function PlannerYearPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const userId = await requireUserId();
  const { year } = await searchParams;
  const y = year ? parseInt(year, 10) : new Date().getFullYear();

  const activityByDate = await getActivityByDate(
    userId,
    `${y}-01-01`,
    `${y}-12-31`,
  );

  const activeDaysPerMonth = Array.from({ length: 12 }, (_, m) => {
    let count = 0;
    for (const [date] of activityByDate) {
      if (new Date(`${date}T00:00:00`).getMonth() === m) count += 1;
    }
    return count;
  });

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{y}</h1>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/planner/year?year=${y - 1}`}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon">
            <Link href={`/planner/year?year=${y + 1}`}>
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 12 }, (_, m) => {
          const monthKey = `${y}-${String(m + 1).padStart(2, "0")}`;
          const activeDays = activeDaysPerMonth[m];
          return (
            <Link
              key={monthKey}
              href={`/planner?month=${monthKey}`}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border px-3 py-4 text-center transition-colors hover:bg-muted",
                activeDays > 0 && "border-primary/40 bg-primary/5",
              )}
            >
              <span className="text-sm font-medium capitalize">
                {format(new Date(y, m, 1), "MMMM", { locale: id })}
              </span>
              <span className="text-xs text-muted-foreground">
                {activeDays > 0 ? `${activeDays} hari aktif` : "—"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
