import type { CategorySummary } from "@/types";

interface CategoryBreakdownProps {
    categories: CategorySummary[];
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
    }).format(amount);

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
    if (categories.length === 0) {
        return (
            <p className="text-muted-foreground text-sm text-center py-8">
                No hay transacciones este mes.
            </p>
        );
    }

    // Separar por tipo para mostrar dos columnas
    const expenses = categories.filter(
        (c) => c.type === "expense" && c.total > 0,
    );
    const incomes = categories.filter(
        (c) => c.type === "income" && c.total > 0,
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CategoryList title="Gastos" items={expenses} type="expense" />
            <CategoryList title="Ingresos" items={incomes} type="income" />
        </div>
    );
}

function CategoryList({
    title,
    items,
    type,
}: {
    title: string;
    items: CategorySummary[];
    type: "income" | "expense";
}) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {title}
            </h3>

            {items.length === 0 ? (
                <p className="text-muted-foreground/50 text-sm py-4">
                    Sin registros.
                </p>
            ) : (
                <div className="space-y-2">
                    {items.map((cat) => (
                        <div
                            key={cat.category_id}
                            className="flex items-center justify-between px-4 py-3 rounded-lg bg-card border border-border"
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className="text-xl w-9 h-9 rounded-lg flex items-center justify-center"
                                    style={{
                                        backgroundColor: `${cat.color}22`,
                                        borderColor: cat.color,
                                        border: `1px solid ${cat.color}55`,
                                    }}
                                >
                                    {cat.icon}
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {cat.category_name || "Sin categoría"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {cat.tx_count}{" "}
                                        {cat.tx_count === 1
                                            ? "transacción"
                                            : "transacciones"}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p
                                    className={`text-sm font-semibold ${
                                        type === "income"
                                            ? "text-emerald-500"
                                            : "text-destructive"
                                    }`}
                                >
                                    {formatCurrency(cat.total)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
