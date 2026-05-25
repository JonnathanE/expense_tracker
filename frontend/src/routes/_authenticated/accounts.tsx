import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AccountCard } from "@/components/shared/AccountCard";
import { AccountForm } from "@/components/shared/AccountForm";
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
    useAccounts,
    useCreateAccount,
    useDeleteAccount,
    useUpdateAccount,
} from "@/hooks/useAccounts";
import { APP_NAME_SHORT } from "@/lib/constants";
import type { AccountFormData } from "@/lib/schemas";
import type { Account } from "@/types";

export const Route = createFileRoute("/_authenticated/accounts")({
    head: () => ({
        meta: [{ title: `${APP_NAME_SHORT} - Accounts` }],
    }),
    component: AccountsPage,
});

function AccountsPage() {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Account | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const { t } = useTranslation();

    const { data: accounts = [], isLoading } = useAccounts();
    const createMutation = useCreateAccount();
    const updateMutation = useUpdateAccount();
    const deleteMutation = useDeleteAccount();

    const handleSubmit = (data: AccountFormData) => {
        if (editing) {
            updateMutation.mutate(
                { id: editing.id, data },
                {
                    onSuccess: () => {
                        toast.success(t("accounts.updated"));
                        closeModal();
                    },
                },
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    toast.success(t("accounts.created"));
                    closeModal();
                },
            });
        }
    };

    const openEdit = (account: Account) => {
        setEditing(account);
        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);
        setEditing(null);
    };

    const handleConfirmDelete = () => {
        if (!pendingDeleteId) return;
        deleteMutation.mutate(pendingDeleteId, {
            onSuccess: () => toast.success(t("accounts.deleted")),
            onSettled: () => setPendingDeleteId(null),
        });
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    // Compute total balance display (just count)
    const totalAccounts = accounts.length;

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t("accounts.title")}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {t("accounts.createdCount", { count: totalAccounts })}
                    </p>
                </div>
                <Button className="gap-2" onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" />
                    {t("accounts.new")}
                </Button>
            </div>

            {/* ── Modal crear / editar ───────────────────────────────── */}
            <Dialog open={open} onOpenChange={closeModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editing
                                ? t("accounts.editTitle")
                                : t("accounts.newTitle")}
                        </DialogTitle>
                    </DialogHeader>
                    <AccountForm
                        onSubmit={handleSubmit}
                        onCancel={closeModal}
                        isPending={isPending}
                        existingCurrency={editing?.currency}
                        defaultValues={
                            editing
                                ? {
                                      name: editing.name,
                                      icon: editing.icon,
                                      color: editing.color,
                                      balance: editing.balance,
                                      currency: editing.currency,
                                      exclude_from_stats:
                                          editing.exclude_from_stats,
                                  }
                                : undefined
                        }
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
                            {t("accounts.deleteTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("accounts.deleteDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {t("common.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleConfirmDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending
                                ? t("accounts.deleting")
                                : t("accounts.deleteConfirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Loading ───────────────────────────────────────────── */}
            {isLoading && (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-16 rounded-lg bg-muted animate-pulse"
                        />
                    ))}
                </div>
            )}

            {/* ── Empty state ───────────────────────────────────────── */}
            {!isLoading && accounts.length === 0 && (
                <div className="text-center py-20 space-y-4">
                    <p className="text-5xl">🏦</p>
                    <p className="text-muted-foreground">
                        {t("accounts.empty")}
                    </p>
                    <Button onClick={() => setOpen(true)}>
                        {t("accounts.createFirst")}
                    </Button>
                </div>
            )}

            {/* ── Lista ─────────────────────────────────────────────── */}
            {!isLoading && accounts.length > 0 && (
                <div className="space-y-2">
                    {accounts.map((account) => (
                        <AccountCard
                            key={account.id}
                            account={account}
                            onEditRequest={openEdit}
                            onDeleteRequest={setPendingDeleteId}
                            isDeleting={deleteMutation.isPending}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
