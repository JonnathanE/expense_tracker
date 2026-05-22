import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CategoryCard } from "@/components/shared/CategoryCard";
import { CategoryForm } from "@/components/shared/CategoryForm";
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
    useCategories,
    useCreateCategory,
    useDeleteCategory,
    useUpdateCategory,
} from "@/hooks/useCategories";
import { APP_NAME_SHORT } from "@/lib/constants";
import type { CategoryFormData } from "@/lib/schemas";
import type { Category } from "@/types";

export const Route = createFileRoute("/_authenticated/categories")({
    head: () => ({
        meta: [{ title: `${APP_NAME_SHORT} - Categories` }],
    }),
    component: CategoriesPage,
});

function CategoriesPage() {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const { t } = useTranslation();

    const { data: categories = [], isLoading } = useCategories();
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const deleteMutation = useDeleteCategory();

    const handleSubmit = (data: CategoryFormData) => {
        if (editing) {
            updateMutation.mutate(
                { id: editing.id, data },
                {
                    onSuccess: () => {
                        toast.success(t("categories.updated"));
                        closeModal();
                    },
                },
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    toast.success(t("categories.created"));
                    closeModal();
                },
            });
        }
    };

    const openEdit = (category: Category) => {
        setEditing(category);
        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);
        setEditing(null);
    };

    const handleConfirmDelete = () => {
        if (!pendingDeleteId) return;
        deleteMutation.mutate(pendingDeleteId, {
            onSuccess: () => toast.success(t("categories.deleted")),
            onSettled: () => setPendingDeleteId(null),
        });
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    const expenses = categories.filter((c) => c.type === "expense");
    const incomes = categories.filter((c) => c.type === "income");

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t("categories.title")}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {t("categories.createdCount", {
                            count: categories.length,
                        })}
                    </p>
                </div>
                <Button className="gap-2" onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" />
                    {t("categories.new")}
                </Button>
            </div>

            {/* ── Modal crear / editar ───────────────────────────────── */}
            <Dialog open={open} onOpenChange={closeModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editing
                                ? t("categories.editTitle")
                                : t("categories.newTitle")}
                        </DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                        onSubmit={handleSubmit}
                        onCancel={closeModal}
                        isPending={isPending}
                        defaultValues={
                            editing
                                ? {
                                      name: editing.name,
                                      type: editing.type,
                                      icon: editing.icon,
                                      color: editing.color,
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
                            {t("categories.deleteTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("categories.deleteDescription")}
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
                                ? t("categories.deleting")
                                : t("categories.deleteConfirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Loading ───────────────────────────────────────────── */}
            {isLoading && (
                <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-16 rounded-lg bg-muted animate-pulse"
                        />
                    ))}
                </div>
            )}

            {/* ── Listas ────────────────────────────────────────────── */}
            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CategoryGroup
                        title={t("categories.expenses")}
                        categories={expenses}
                        emptyLabel={t("categories.empty")}
                        onEditRequest={openEdit}
                        onDeleteRequest={setPendingDeleteId}
                        isDeleting={deleteMutation.isPending}
                    />

                    <CategoryGroup
                        title={t("categories.incomes")}
                        categories={incomes}
                        emptyLabel={t("categories.empty")}
                        onEditRequest={openEdit}
                        onDeleteRequest={setPendingDeleteId}
                        isDeleting={deleteMutation.isPending}
                    />
                </div>
            )}
        </div>
    );
}

function CategoryGroup({
    title,
    categories,
    emptyLabel,
    onEditRequest,
    onDeleteRequest,
    isDeleting,
}: {
    title: string;
    categories: ReturnType<typeof useCategories>["data"];
    emptyLabel: string;
    onEditRequest: (category: Category) => void;
    onDeleteRequest: (id: string) => void;
    isDeleting: boolean;
}) {
    return (
        <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {title}
            </h2>
            {!categories || categories.length === 0 ? (
                <p className="text-muted-foreground/50 text-sm py-4">
                    {emptyLabel}
                </p>
            ) : (
                <div className="space-y-2">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            onEditRequest={onEditRequest}
                            onDeleteRequest={onDeleteRequest}
                            isDeleting={isDeleting}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
