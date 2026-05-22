import { createFileRoute } from "@tanstack/react-router";
import { CategoryBreakdown } from "@/components/shared/CategoryBreakdown";
import { MonthPicker } from "@/components/shared/MonthPicker";
import { SummaryCards } from "@/components/shared/SummaryCards";
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

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Resumen de tus finanzas
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
                        Error cargando el resumen. Intenta de nuevo.
                    </p>
                </div>
            )}

            {/* ── Contenido ─────────────────────────────────────────── */}
            {summary && (
                <>
                    <SummaryCards summary={summary} />

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-foreground">
                            Por categoría
                        </h2>
                        <CategoryBreakdown categories={summary.by_category} />
                    </div>
                </>
            )}
        </div>
    );
}
