import { useTranslation } from "react-i18next";
import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceLine,
    XAxis,
    YAxis,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { DailySummary } from "@/types";

interface DailyBalanceChartProps {
    data: DailySummary[];
    isLoading?: boolean;
}

const chartConfig = {
    balance: {
        label: "Balance",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

function formatDay(dateStr: string): string {
    // dateStr = "YYYY-MM-DD" → mostrar "DD/MM"
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}`;
}

// Para el eje Y: sin decimales para no saturar el espacio
function formatCurrencyAxis(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

// Para el tooltip: con 2 decimales para mostrar el valor exacto
function formatCurrencyTooltip(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function DailyBalanceChart({ data, isLoading }: DailyBalanceChartProps) {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-56 mt-1" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[220px] w-full rounded-lg" />
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t("dashboard.balanceChart")}</CardTitle>
                    <CardDescription>
                        {t("dashboard.balanceChartSubtitle")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[220px]">
                    <p className="text-sm text-muted-foreground">
                        {t("dashboard.noChartData")}
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Calcular dominio Y con algo de padding
    const balances = data.map((d) => d.balance);
    const minVal = Math.min(...balances);
    const maxVal = Math.max(...balances);
    const padding = Math.abs(maxVal - minVal) * 0.15 || 50;
    const yMin = Math.floor(minVal - padding);
    const yMax = Math.ceil(maxVal + padding);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("dashboard.balanceChart")}</CardTitle>
                <CardDescription>
                    {t("dashboard.balanceChartSubtitle")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[220px] w-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={data}
                        margin={{ top: 8, right: 8, left: 8, bottom: 4 }}
                    >
                        <CartesianGrid
                            vertical={false}
                            stroke="var(--border)"
                            strokeDasharray="3 3"
                        />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={formatDay}
                            tick={{ fontSize: 11 }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => formatCurrencyAxis(v)}
                            domain={[yMin, yMax]}
                            width={72}
                        />
                        <ReferenceLine
                            y={0}
                            stroke="var(--muted-foreground)"
                            strokeDasharray="4 2"
                            strokeOpacity={0.5}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value) =>
                                        formatCurrencyTooltip(value as number)
                                    }
                                    labelFormatter={(label) =>
                                        formatDay(label as string)
                                    }
                                />
                            }
                        />
                        <Line
                            type="monotone"
                            dataKey="balance"
                            stroke="var(--color-balance)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
