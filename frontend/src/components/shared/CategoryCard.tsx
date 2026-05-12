import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types";

interface CategoryCardProps {
    category: Category;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

export function CategoryCard({
    category,
    onDelete,
    isDeleting,
}: CategoryCardProps) {
    return (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 group">
            <div className="flex items-center gap-3">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                    style={{
                        backgroundColor: `${category.color}22`,
                        borderColor: category.color,
                        border: "1px solid",
                    }}
                >
                    {category.icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-zinc-200">
                        {category.name}
                    </p>
                    <Badge
                        variant="secondary"
                        className={`text-xs mt-0.5 ${
                            category.type === "income"
                                ? "bg-emerald-950 text-emerald-400"
                                : "bg-red-950 text-red-400"
                        }`}
                    >
                        {category.type === "income" ? "Ingreso" : "Gasto"}
                    </Badge>
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-950 transition-all"
                onClick={() => onDelete(category.id)}
                disabled={isDeleting}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
