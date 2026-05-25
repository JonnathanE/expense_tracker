import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownUp, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { MonthPicker } from "@/components/shared/MonthPicker";
import { TransactionForm } from "@/components/shared/TransactionForm";
import { TransactionItem } from "@/components/shared/TransactionItem";
import { TransferForm } from "@/components/shared/TransferForm";
import { TransferItem } from "@/components/shared/TransferItem";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import {
    useCreateTransaction,
    useDeleteTransaction,
    useTransactions,
    useUpdateTransaction,
} from "@/hooks/useTransactions";
import {
    useCreateTransfer,
    useDeleteTransfer,
    useTransfers,
} from "@/hooks/useTransfers";
import { APP_NAME_SHORT } from "@/lib/constants";
import type { TransactionFormData, TransferFormData } from "@/lib/schemas";
import { type FilterType, useFilterStore } from "@/store/filterStore";
import type { Transaction } from "@/types";

export const Route = createFileRoute("/_authenticated/transactions")({
    head: () => ({
        meta: [{ title: `${APP_NAME_SHORT} - Transactions` }],
    }),
    component: TransactionsPage,
});

function TransactionsPage() {
    const [tab, setTab] = useState<"transactions" | "transfers">(
        "transactions",
    );
    const [txOpen, setTxOpen] = useState(false);
    const [editing, setEditing] = useState<Transaction | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const [tfOpen, setTfOpen] = useState(false);
    const [pendingDeleteTransferId, setPendingDeleteTransferId] = useState<
        string | null
    >(null);

    const { t, i18n } = useTranslation();

    // Filter state
    const filterType = useFilterStore((s) => s.filterType);
    const filterAccountId = useFilterStore((s) => s.filterAccountId);
    const filterCategoryId = useFilterStore((s) => s.filterCategoryId);
    const sortOrder = useFilterStore((s) => s.sortOrder);
    const setFilterType = useFilterStore((s) => s.setFilterType);
    const setFilterAccountId = useFilterStore((s) => s.setFilterAccountId);
    const setFilterCategoryId = useFilterStore((s) => s.setFilterCategoryId);
    const setSortOrder = useFilterStore((s) => s.setSortOrder);

    const { data: transactions = [], isLoading: txLoading } = useTransactions();
    const { data: transfers = [], isLoading: tfLoading } = useTransfers();
    const { data: accounts = [] } = useAccounts();
    const { data: categories = [] } = useCategories();

    const createTxMutation = useCreateTransaction();
    const updateTxMutation = useUpdateTransaction();
    const deleteTxMutation = useDeleteTransaction();

    const createTfMutation = useCreateTransfer();
    const deleteTfMutation = useDeleteTransfer();

    // ── Transactions handlers ──────────────────────────────────────────────
    const handleTxSubmit = (data: TransactionFormData) => {
        if (editing) {
            updateTxMutation.mutate(
                { id: editing.id, data },
                {
                    onSuccess: () => {
                        toast.success(t("transactions.updated"));
                        closeTxModal();
                    },
                },
            );
        } else {
            createTxMutation.mutate(data, {
                onSuccess: () => {
                    toast.success(t("transactions.created"));
                    closeTxModal();
                },
            });
        }
    };

    const openEditTx = (tx: Transaction) => {
        setEditing(tx);
        setTxOpen(true);
    };

    const closeTxModal = () => {
        setTxOpen(false);
        setEditing(null);
    };

    const handleConfirmDeleteTx = () => {
        if (!pendingDeleteId) return;
        deleteTxMutation.mutate(pendingDeleteId, {
            onSuccess: () => toast.success(t("transactions.deleted")),
            onSettled: () => setPendingDeleteId(null),
        });
    };

    // ── Transfers handlers ─────────────────────────────────────────────────
    const handleTfSubmit = (data: TransferFormData) => {
        createTfMutation.mutate(data, {
            onSuccess: () => {
                toast.success(t("transfers.created"));
                setTfOpen(false);
            },
        });
    };

    const handleConfirmDeleteTf = () => {
        if (!pendingDeleteTransferId) return;
        deleteTfMutation.mutate(pendingDeleteTransferId, {
            onSuccess: () => toast.success(t("transfers.deleted")),
            onSettled: () => setPendingDeleteTransferId(null),
        });
    };

    const isTxPending =
        createTxMutation.isPending || updateTxMutation.isPending;

    // ── Group transactions by date ────────────────────────────────────────
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
        const locale = i18n.language === "en" ? "en-US" : "es-EC";
        return new Date(year, month - 1, day).toLocaleDateString(locale, {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
    };

    return (
        <div className="p-8 space-y-6 max-w-3xl mx-auto">
            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t("transactions.title")}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {tab === "transactions"
                            ? t("transactions.recordsThisMonth", {
                                  count: transactions.length,
                              })
                            : t("transfers.recordsThisPeriod", {
                                  count: transfers.length,
                              })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <MonthPicker />
                    <Button
                        className="gap-2"
                        onClick={() =>
                            tab === "transfers"
                                ? setTfOpen(true)
                                : setTxOpen(true)
                        }
                    >
                        <Plus className="h-4 w-4" />
                        {tab === "transfers"
                            ? t("transfers.new")
                            : t("transactions.new")}
                    </Button>
                </div>
            </div>

            {/* ── Tabs ──────────────────────────────────────────────── */}
            <Tabs
                value={tab}
                onValueChange={(v) => setTab(v as "transactions" | "transfers")}
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <TabsList>
                        <TabsTrigger value="transactions">
                            {t("transactions.tabLabel")}
                        </TabsTrigger>
                        <TabsTrigger value="transfers">
                            {t("transfers.tabLabel")}
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Filters (only for transactions tab) ─────────── */}
                    {tab === "transactions" && (
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Sort */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() =>
                                    setSortOrder(
                                        sortOrder === "desc" ? "asc" : "desc",
                                    )
                                }
                            >
                                <ArrowDownUp className="h-3.5 w-3.5" />
                                {sortOrder === "desc"
                                    ? t("filters.newest")
                                    : t("filters.oldest")}
                            </Button>

                            {/* Type filter */}
                            <Select
                                value={filterType}
                                onValueChange={(v) =>
                                    setFilterType(v as FilterType)
                                }
                            >
                                <SelectTrigger className="h-8 w-auto gap-1 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t("filters.all")}
                                    </SelectItem>
                                    <SelectItem value="expense">
                                        {t("filters.expenses")}
                                    </SelectItem>
                                    <SelectItem value="income">
                                        {t("filters.incomes")}
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Account filter */}
                            {accounts.length > 0 && (
                                <Select
                                    value={filterAccountId || "__all__"}
                                    onValueChange={(v) =>
                                        setFilterAccountId(
                                            v === "__all__" ? "" : v,
                                        )
                                    }
                                >
                                    <SelectTrigger className="h-8 w-auto gap-1 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">
                                            {t("filters.allAccounts")}
                                        </SelectItem>
                                        {accounts.map((a) => (
                                            <SelectItem key={a.id} value={a.id}>
                                                {a.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Category filter */}
                            {categories.length > 0 && (
                                <Select
                                    value={filterCategoryId || "__all__"}
                                    onValueChange={(v) =>
                                        setFilterCategoryId(
                                            v === "__all__" ? "" : v,
                                        )
                                    }
                                >
                                    <SelectTrigger className="h-8 w-auto gap-1 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">
                                            {t("filters.allCategories")}
                                        </SelectItem>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Transactions tab ──────────────────────────────── */}
                <TabsContent value="transactions" className="mt-6 space-y-6">
                    {/* Modal crear / editar transacción */}
                    <Dialog open={txOpen} onOpenChange={closeTxModal}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editing
                                        ? t("transactions.editTitle")
                                        : t("transactions.newTitle")}
                                </DialogTitle>
                            </DialogHeader>
                            <TransactionForm
                                onSubmit={handleTxSubmit}
                                onCancel={closeTxModal}
                                isPending={isTxPending}
                                defaultValues={editing ?? undefined}
                            />
                        </DialogContent>
                    </Dialog>

                    {/* Confirm delete transaction */}
                    <AlertDialog
                        open={!!pendingDeleteId}
                        onOpenChange={(open) =>
                            !open && setPendingDeleteId(null)
                        }
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {t("transactions.deleteTitle")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t("transactions.deleteDescription")}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    {t("common.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={handleConfirmDeleteTx}
                                    disabled={deleteTxMutation.isPending}
                                >
                                    {deleteTxMutation.isPending
                                        ? t("transactions.deleting")
                                        : t("transactions.deleteConfirm")}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {txLoading && (
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="h-16 rounded-lg bg-muted animate-pulse"
                                />
                            ))}
                        </div>
                    )}

                    {!txLoading && transactions.length === 0 && (
                        <div className="text-center py-20 space-y-4">
                            <p className="text-5xl">📭</p>
                            <p className="text-muted-foreground">
                                {t("transactions.empty")}
                            </p>
                            <Button onClick={() => setTxOpen(true)}>
                                {t("transactions.createFirst")}
                            </Button>
                        </div>
                    )}

                    {!txLoading &&
                        Object.entries(grouped).map(([date, txs]) => (
                            <div key={date} className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {formatGroupDate(date)}
                                </p>
                                {txs.map((tx) => (
                                    <TransactionItem
                                        key={tx.id}
                                        transaction={tx}
                                        onEdit={openEditTx}
                                        onDeleteRequest={setPendingDeleteId}
                                        isDeleting={deleteTxMutation.isPending}
                                    />
                                ))}
                            </div>
                        ))}
                </TabsContent>

                {/* ── Transfers tab ─────────────────────────────────── */}
                <TabsContent value="transfers" className="mt-6 space-y-4">
                    {/* Modal crear transferencia */}
                    <Dialog open={tfOpen} onOpenChange={setTfOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {t("transfers.newTitle")}
                                </DialogTitle>
                            </DialogHeader>
                            <TransferForm
                                accounts={accounts}
                                onSubmit={handleTfSubmit}
                                onCancel={() => setTfOpen(false)}
                                isPending={createTfMutation.isPending}
                            />
                        </DialogContent>
                    </Dialog>

                    {/* Confirm delete transfer */}
                    <AlertDialog
                        open={!!pendingDeleteTransferId}
                        onOpenChange={(open) =>
                            !open && setPendingDeleteTransferId(null)
                        }
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {t("transfers.deleteTitle")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t("transfers.deleteDescription")}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    {t("common.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={handleConfirmDeleteTf}
                                    disabled={deleteTfMutation.isPending}
                                >
                                    {deleteTfMutation.isPending
                                        ? t("transfers.deleting")
                                        : t("transfers.deleteConfirm")}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {tfLoading && (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-16 rounded-lg bg-muted animate-pulse"
                                />
                            ))}
                        </div>
                    )}

                    {!tfLoading && transfers.length === 0 && (
                        <div className="text-center py-20 space-y-4">
                            <p className="text-5xl">🔄</p>
                            <p className="text-muted-foreground">
                                {t("transfers.empty")}
                            </p>
                            {accounts.length >= 2 ? (
                                <Button onClick={() => setTfOpen(true)}>
                                    {t("transfers.createFirst")}
                                </Button>
                            ) : (
                                <p className="text-muted-foreground text-xs">
                                    {t("transfers.needTwoAccounts")}
                                </p>
                            )}
                        </div>
                    )}

                    {!tfLoading && transfers.length > 0 && (
                        <div className="space-y-2">
                            {transfers.map((tf) => (
                                <TransferItem
                                    key={tf.id}
                                    transfer={tf}
                                    onDeleteRequest={setPendingDeleteTransferId}
                                    isDeleting={deleteTfMutation.isPending}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
