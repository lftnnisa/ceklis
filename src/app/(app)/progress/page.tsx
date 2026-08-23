import { Flame, Lightbulb, TrendingDown } from "lucide-react";
import { requireUserId } from "@/lib/db/rls";
import { computeInsights } from "@/lib/insights";
import { CompletionChart } from "@/components/progress/completion-chart";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProgressPage() {
  const userId = await requireUserId();
  const insights = await computeInsights(userId);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
        <p className="text-sm text-muted-foreground">30 hari terakhir.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-1 py-4">
            <Flame className="size-5 text-orange-500" />
            <span className="text-lg font-bold">
              {insights.topStreakHabit?.streak ?? 0}
            </span>
            <span className="text-center text-xs text-muted-foreground">
              {insights.topStreakHabit?.name ?? "Belum ada streak"}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 py-4">
            <TrendingDown className="size-5 text-rose-500" />
            <span className="text-lg font-bold">
              {insights.mostSkippedHabit?.skips ?? 0}
            </span>
            <span className="text-center text-xs text-muted-foreground">
              {insights.mostSkippedHabit?.name ?? "Belum ada yang sering di-skip"}
            </span>
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Completion rate per kategori
        </h2>
        <CompletionChart categoryStats={insights.categoryStats} />
      </section>

      {insights.textInsights.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Insight</h2>
          <ul className="flex flex-col gap-2">
            {insights.textInsights.map((text, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-xl border bg-amber-50 px-3 py-2.5 text-sm dark:bg-amber-950/30"
              >
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
                {text}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
