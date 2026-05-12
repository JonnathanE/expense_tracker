import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/types";

interface TransactionItemProps {
    transaction: Transaction;
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
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
    onDelete,
    isDeleting,
}: TransactionItemProps) {
    const isIncome = transaction.type === "income";

    return (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 group hover:border-zinc-700 transition-colors">
            {/* Izquierda */}
            <div className="flex items-center gap-4">
                <div className="text-center min-w-10">
                    <p className="text-xs text-zinc-500 uppercase">
                        {formatDate(transaction.date)}
                    </p>
                </div>

                <div>
                    <p className="text-sm font-medium text-zinc-200">
                        {transaction.description ||
                            transaction.category_name ||
                            "—"}
                    </p>
                    {transaction.category_name && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                            {transaction.category_name}
                        </p>
                    )}
                </div>
            </div>

            {/* Derecha */}
            <div className="flex items-center gap-3">
                <span
                    className={`text-sm font-semibold ${
                        isIncome ? "text-emerald-400" : "text-red-400"
                    }`}
                >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                </span>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
                        onClick={() => onEdit(transaction)}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-950"
                        onClick={() => onDelete(transaction.id)}
                        disabled={isDeleting}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
