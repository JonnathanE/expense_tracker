import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Summary } from "@/types";

interface SummaryCardsProps {
    summary: Summary;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
    }).format(amount);

export function SummaryCards({ summary }: SummaryCardsProps) {
    const cards = [
        {
            label: "Balance",
            value: summary.balance,
            icon: Wallet,
            color:
                summary.balance >= 0 ? "text-foreground" : "text-destructive",
            bg: "bg-muted",
            border: "border-border",
        },
        {
            label: "Ingresos",
            value: summary.total_income,
            icon: TrendingUp,
            color: "text-emerald-800",
            bg: "bg-emerald-200/10",
            border: "border-emerald-200/50",
        },
        {
            label: "Gastos",
            value: summary.total_expense,
            icon: TrendingDown,
            color: "text-destructive",
            bg: "bg-destructive/10",
            border: "border-destructive/20",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map(({ label, value, icon: Icon, color, bg, border }) => (
                <Card key={label} className={`${bg} ${border} border`}>
                    <CardContent className="pt-5 pb-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground font-medium">
                                {label}
                            </span>
                            <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <p className={`text-2xl font-bold ${color}`}>
                            {formatCurrency(value)}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
