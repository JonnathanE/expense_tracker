import { createFileRoute } from "@tanstack/react-router";
import { CategoryBreakdown } from "@/components/shared/CategoryBreakdown";
import { MonthPicker } from "@/components/shared/MonthPicker";
import { SummaryCards } from "@/components/shared/SummaryCards";
import { useSummary } from "@/hooks/useSummary";

export const Route = createFileRoute("/_authenticated/")({
    component: DashboardPage,
});

function DashboardPage() {
    const { data: summary, isLoading, isError } = useSummary();

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-zinc-400 text-sm mt-1">
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
                                className="h-24 rounded-lg bg-zinc-800 animate-pulse"
                            />
                        ))}
                    </div>
                    <div className="h-48 rounded-lg bg-zinc-800 animate-pulse" />
                </div>
            )}

            {/* ── Error ─────────────────────────────────────────────── */}
            {isError && (
                <div className="text-center py-16">
                    <p className="text-red-400 text-sm">
                        Error cargando el resumen. Intenta de nuevo.
                    </p>
                </div>
            )}

            {/* ── Contenido ─────────────────────────────────────────── */}
            {summary && (
                <>
                    <SummaryCards summary={summary} />

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white">
                            Por categoría
                        </h2>
                        <CategoryBreakdown categories={summary.by_category} />
                    </div>
                </>
            )}
        </div>
    );
}
