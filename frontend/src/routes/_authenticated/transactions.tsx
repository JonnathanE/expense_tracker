import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { MonthPicker } from "@/components/shared/MonthPicker";
import { TransactionForm } from "@/components/shared/TransactionForm";
import { TransactionItem } from "@/components/shared/TransactionItem";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    useCreateTransaction,
    useDeleteTransaction,
    useTransactions,
    useUpdateTransaction,
} from "@/hooks/useTransactions";
import type { TransactionFormData } from "@/lib/schemas";
import type { Transaction } from "@/types";

export const Route = createFileRoute("/_authenticated/transactions")({
    component: TransactionsPage,
});

function TransactionsPage() {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Transaction | null>(null);

    const { data: transactions = [], isLoading } = useTransactions();
    const createMutation = useCreateTransaction();
    const updateMutation = useUpdateTransaction();
    const deleteMutation = useDeleteTransaction();

    const handleSubmit = (data: TransactionFormData) => {
        if (editing) {
            updateMutation.mutate(
                { id: editing.id, data },
                { onSuccess: closeModal },
            );
        } else {
            createMutation.mutate(data, { onSuccess: closeModal });
        }
    };

    const openEdit = (transaction: Transaction) => {
        setEditing(transaction);
        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);
        setEditing(null);
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    // Agrupar por fecha para mostrar separadores
    const grouped = transactions.reduce<Record<string, Transaction[]>>(
        (acc, tx) => {
            const day = tx.date.slice(0, 10);
            if (!acc[day]) acc[day] = [];
            acc[day].push(tx);
            return acc;
        },
        {},
    );

    const formatGroupDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("es-EC", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });

    return (
        <div className="p-8 space-y-8 max-w-3xl mx-auto">
            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Transacciones
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        {transactions.length} registros este mes
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <MonthPicker />
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-500 gap-2"
                        onClick={() => setOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Nueva
                    </Button>
                </div>
            </div>

            {/* ── Modal ─────────────────────────────────────────────── */}
            <Dialog open={open} onOpenChange={closeModal}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            {editing
                                ? "Editar transacción"
                                : "Nueva transacción"}
                        </DialogTitle>
                    </DialogHeader>
                    <TransactionForm
                        onSubmit={handleSubmit}
                        onCancel={closeModal}
                        isPending={isPending}
                        defaultValues={editing ?? undefined}
                    />
                </DialogContent>
            </Dialog>

            {/* ── Loading ───────────────────────────────────────────── */}
            {isLoading && (
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="h-16 rounded-lg bg-zinc-800 animate-pulse"
                        />
                    ))}
                </div>
            )}

            {/* ── Empty state ───────────────────────────────────────── */}
            {!isLoading && transactions.length === 0 && (
                <div className="text-center py-20 space-y-4">
                    <p className="text-5xl">📭</p>
                    <p className="text-zinc-400">
                        No hay transacciones este mes.
                    </p>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-500"
                        onClick={() => setOpen(true)}
                    >
                        Crear la primera
                    </Button>
                </div>
            )}

            {/* ── Lista agrupada por día ─────────────────────────────── */}
            {!isLoading &&
                Object.entries(grouped).map(([date, txs]) => (
                    <div key={date} className="space-y-2">
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                            {formatGroupDate(date)}
                        </p>
                        {txs.map((tx) => (
                            <TransactionItem
                                key={tx.id}
                                transaction={tx}
                                onEdit={openEdit}
                                onDelete={(id) => deleteMutation.mutate(id)}
                                isDeleting={deleteMutation.isPending}
                            />
                        ))}
                    </div>
                ))}
        </div>
    );
}
