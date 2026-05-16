import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
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
import type { CategoryFormData } from "@/lib/schemas";
import type { Category } from "@/types";

export const Route = createFileRoute("/_authenticated/categories")({
    component: CategoriesPage,
});

function CategoriesPage() {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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
                        toast.success("Categoría actualizada");
                        closeModal();
                    },
                },
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    toast.success("Categoría creada");
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
            onSuccess: () => toast.success("Categoría eliminada"),
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
                        Categorías
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {categories.length} categorías creadas
                    </p>
                </div>
                <Button className="gap-2" onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Nueva categoría
                </Button>
            </div>

            {/* ── Modal crear / editar ───────────────────────────────── */}
            <Dialog open={open} onOpenChange={closeModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? "Editar categoría" : "Nueva categoría"}
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
                            ¿Eliminar categoría?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. La categoría será
                            eliminada permanentemente.
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
                        title="Gastos"
                        categories={expenses}
                        onEditRequest={openEdit}
                        onDeleteRequest={setPendingDeleteId}
                        isDeleting={deleteMutation.isPending}
                    />

                    <CategoryGroup
                        title="Ingresos"
                        categories={incomes}
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
    onEditRequest,
    onDeleteRequest,
    isDeleting,
}: {
    title: string;
    categories: ReturnType<typeof useCategories>["data"];
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
                    Sin categorías aún.
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
