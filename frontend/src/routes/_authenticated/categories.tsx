import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CategoryCard } from "@/components/shared/CategoryCard";
import { CategoryForm } from "@/components/shared/CategoryForm";
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
} from "@/hooks/useCategories";
import type { CategoryFormData } from "@/lib/schemas";

export const Route = createFileRoute("/_authenticated/categories")({
    component: CategoriesPage,
});

function CategoriesPage() {
    const [open, setOpen] = useState(false);

    const { data: categories = [], isLoading } = useCategories();
    const createMutation = useCreateCategory();
    const deleteMutation = useDeleteCategory();

    const handleSubmit = (data: CategoryFormData) => {
        createMutation.mutate(data, {
            onSuccess: () => setOpen(false),
        });
    };

    const expenses = categories.filter((c) => c.type === "expense");
    const incomes = categories.filter((c) => c.type === "income");

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Categorías
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        {categories.length} categorías creadas
                    </p>
                </div>
                <Button
                    className="bg-indigo-600 hover:bg-indigo-500 gap-2"
                    onClick={() => setOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    Nueva categoría
                </Button>
            </div>

            {/* ── Modal ─────────────────────────────────────────────── */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            Nueva categoría
                        </DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                        onSubmit={handleSubmit}
                        onCancel={() => setOpen(false)}
                        isPending={createMutation.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* ── Loading ───────────────────────────────────────────── */}
            {isLoading && (
                <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-16 rounded-lg bg-zinc-800 animate-pulse"
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
                        onDelete={(id) => deleteMutation.mutate(id)}
                        isDeleting={deleteMutation.isPending}
                    />

                    <CategoryGroup
                        title="Ingresos"
                        categories={incomes}
                        onDelete={(id) => deleteMutation.mutate(id)}
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
    onDelete,
    isDeleting,
}: {
    title: string;
    categories: ReturnType<typeof useCategories>["data"];
    onDelete: (id: string) => void;
    isDeleting: boolean;
}) {
    return (
        <div className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                {title}
            </h2>
            {!categories || categories.length === 0 ? (
                <p className="text-zinc-600 text-sm py-4">
                    Sin categorías aún.
                </p>
            ) : (
                <div className="space-y-2">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            onDelete={onDelete}
                            isDeleting={isDeleting}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
