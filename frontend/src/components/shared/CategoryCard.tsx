import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types";

interface CategoryCardProps {
    category: Category;
    onEditRequest: (category: Category) => void;
    onDeleteRequest: (id: string) => void;
    isDeleting: boolean;
}

export function CategoryCard({
    category,
    onEditRequest,
    onDeleteRequest,
    isDeleting,
}: CategoryCardProps) {
    return (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-card border border-border group">
            <div className="flex items-center gap-3">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                    style={{
                        backgroundColor: `${category.color}22`,
                        borderColor: category.color,
                        border: `1px solid ${category.color}55`,
                    }}
                >
                    {category.icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">
                        {category.name}
                    </p>
                    <Badge
                        variant="secondary"
                        className={`text-xs mt-0.5 ${
                            category.type === "income"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-destructive/15 text-destructive"
                        }`}
                    >
                        {category.type === "income" ? "Ingreso" : "Gasto"}
                    </Badge>
                </div>
            </div>

            <div className="flex gap-1 lg:opacity-0 group-hover:opacity-100 transition-all">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => onEditRequest(category)}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    onClick={() => onDeleteRequest(category.id)}
                    disabled={isDeleting}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
