import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MonthPicker } from "@/components/shared/MonthPicker";
import { TransactionForm } from "@/components/shared/TransactionForm";
import { TransactionItem } from "@/components/shared/TransactionItem";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { APP_NAME_SHORT } from "@/lib/constants";
import type { TransactionFormData } from "@/lib/schemas";
import type { Transaction } from "@/types";

export const Route = createFileRoute("/_authenticated/transactions")({
    head: () => ({
        meta: [{ title: `${APP_NAME_SHORT} - Transactions` }],
    }),
    component: TransactionsPage,
});

function TransactionsPage() {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Transaction | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const { data: transactions = [], isLoading } = useTransactions();
    const createMutation = useCreateTransaction();
    const updateMutation = useUpdateTransaction();
    const deleteMutation = useDeleteTransaction();

    const handleSubmit = (data: TransactionFormData) => {
        if (editing) {
            updateMutation.mutate(
                { id: editing.id, data },
                {
                    onSuccess: () => {
                        toast.success("Transacción actualizada");
                        closeModal();
                    },
                },
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    toast.success("Transacción creada");
                    closeModal();
                },
            });
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

    const handleConfirmDelete = () => {
        if (!pendingDeleteId) return;
        deleteMutation.mutate(pendingDeleteId, {
            onSuccess: () => toast.success("Transacción eliminada"),
            onSettled: () => setPendingDeleteId(null),
        });
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

    const formatGroupDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day).toLocaleDateString("es-EC", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
    };

    return (
        <div className="p-8 space-y-8 max-w-3xl mx-auto">
            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Transacciones
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {transactions.length} registros este mes
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <MonthPicker />
                    <Button className="gap-2" onClick={() => setOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Nueva
                    </Button>
                </div>
            </div>

            {/* ── Modal crear / editar ───────────────────────────────── */}
            <Dialog open={open} onOpenChange={closeModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
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

            {/* ── Confirmación de eliminación ───────────────────────── */}
            <AlertDialog
                open={!!pendingDeleteId}
                onOpenChange={(open) => !open && setPendingDeleteId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            ¿Eliminar transacción?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. La transacción
                            será eliminada permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleConfirmDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending
                                ? "Eliminando..."
                                : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Loading ───────────────────────────────────────────── */}
            {isLoading && (
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="h-16 rounded-lg bg-muted animate-pulse"
                        />
                    ))}
                </div>
            )}

            {/* ── Empty state ───────────────────────────────────────── */}
            {!isLoading && transactions.length === 0 && (
                <div className="text-center py-20 space-y-4">
                    <p className="text-5xl">📭</p>
                    <p className="text-muted-foreground">
                        No hay transacciones este mes.
                    </p>
                    <Button onClick={() => setOpen(true)}>
                        Crear la primera
                    </Button>
                </div>
            )}

            {/* ── Lista agrupada por día ─────────────────────────────── */}
            {!isLoading &&
                Object.entries(grouped).map(([date, txs]) => (
                    <div key={date} className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {formatGroupDate(date)}
                        </p>
                        {txs.map((tx) => (
                            <TransactionItem
                                key={tx.id}
                                transaction={tx}
                                onEdit={openEdit}
                                onDeleteRequest={setPendingDeleteId}
                                isDeleting={deleteMutation.isPending}
                            />
                        ))}
                    </div>
                ))}
        </div>
    );
}
