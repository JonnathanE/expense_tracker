import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { CategoryBreakdown } from "@/components/shared/CategoryBreakdown";
import { DailyBalanceChart } from "@/components/shared/DailyBalanceChart";
import { MonthPicker } from "@/components/shared/MonthPicker";
import { SummaryCards } from "@/components/shared/SummaryCards";
import { useDailySummary } from "@/hooks/useDailySummary";
import { useSummary } from "@/hooks/useSummary";
import { APP_NAME_SHORT } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/")({
    head: () => ({
        meta: [{ title: `${APP_NAME_SHORT} - Dashboard` }],
    }),
    component: DashboardPage,
});

function DashboardPage() {
    const { data: summary, isLoading, isError } = useSummary();
    const { data: dailyData, isLoading: isDailyLoading } = useDailySummary();
    const { t } = useTranslation();

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t("dashboard.title")}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {t("dashboard.subtitle")}
                    </p>
                </div>
                <MonthPicker />
            </div>

            {/* ── Loading ───────────────────────────────────────────── */}
            {isLoading && (
                <div className="space-y-4">
                    {/* Skeleton de las cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-24 rounded-lg bg-muted animate-pulse"
                            />
                        ))}
                    </div>
                    <div className="h-48 rounded-lg bg-muted animate-pulse" />
                </div>
            )}

            {/* ── Error ─────────────────────────────────────────────── */}
            {isError && (
                <div className="text-center py-16">
                    <p className="text-destructive text-sm">
                        {t("dashboard.errorLoading")}
                    </p>
                </div>
            )}

            {/* ── Contenido ─────────────────────────────────────────── */}
            {summary && (
                <>
                    <SummaryCards summary={summary} />

                    <DailyBalanceChart
                        data={dailyData ?? []}
                        isLoading={isDailyLoading}
                    />

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-foreground">
                            {t("dashboard.byCategory")}
                        </h2>
                        <CategoryBreakdown categories={summary.by_category} />
                    </div>
                </>
            )}
        </div>
    );
}
