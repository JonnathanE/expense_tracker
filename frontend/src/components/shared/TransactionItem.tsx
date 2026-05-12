import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/types";

interface TransactionItemProps {
    transaction: Transaction;
    onEdit: (transaction: Transaction) => void;
    onDeleteRequest: (id: string) => void;
    isDeleting: boolean;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
    }).format(amount);

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "short",
    });

export function TransactionItem({
    transaction,
    onEdit,
    onDeleteRequest,
    isDeleting,
}: TransactionItemProps) {
    const isIncome = transaction.type === "income";

    return (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-card border border-border group hover:border-muted-foreground/30 transition-colors">
            {/* Izquierda */}
            <div className="flex items-center gap-4">
                <div className="text-center min-w-10">
                    <p className="text-xs text-muted-foreground uppercase">
                        {formatDate(transaction.date)}
                    </p>
                </div>

                <div>
                    <p className="text-sm font-medium text-foreground">
                        {transaction.description ||
                            transaction.category_name ||
                            "—"}
                    </p>
                    {transaction.category_name && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {transaction.category_name}
                        </p>
                    )}
                </div>
            </div>

            {/* Derecha */}
            <div className="flex items-center gap-3">
                <span
                    className={`text-sm font-semibold ${
                        isIncome ? "text-emerald-500" : "text-destructive"
                    }`}
                >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                </span>

                <div className="flex gap-1 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => onEdit(transaction)}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDeleteRequest(transaction.id)}
                        disabled={isDeleting}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
