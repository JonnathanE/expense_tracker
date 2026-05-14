export interface ColorOption {
    name: string;
    label: string;
    value: string;
}

export interface ColorGroup {
    group: string;
    colors: ColorOption[];
}

export const CATEGORY_COLOR_GROUPS: ColorGroup[] = [
    {
        group: "Rojos",
        colors: [
            { name: "red-400", label: "Rojo claro", value: "#f87171" },
            { name: "red-500", label: "Rojo", value: "#ef4444" },
            { name: "red-600", label: "Rojo oscuro", value: "#dc2626" },
            { name: "rose-400", label: "Rosa claro", value: "#fb7185" },
            { name: "rose-500", label: "Rosa", value: "#f43f5e" },
            { name: "rose-600", label: "Rosa oscuro", value: "#e11d48" },
        ],
    },
    {
        group: "Naranjas",
        colors: [
            { name: "orange-400", label: "Naranja claro", value: "#fb923c" },
            { name: "orange-500", label: "Naranja", value: "#f97316" },
            { name: "orange-600", label: "Naranja oscuro", value: "#ea580c" },
            { name: "amber-400", label: "Ámbar claro", value: "#fbbf24" },
            { name: "amber-500", label: "Ámbar", value: "#f59e0b" },
            { name: "amber-600", label: "Ámbar oscuro", value: "#d97706" },
        ],
    },
    {
        group: "Amarillos",
        colors: [
            { name: "yellow-400", label: "Amarillo claro", value: "#facc15" },
            { name: "yellow-500", label: "Amarillo", value: "#eab308" },
            { name: "yellow-600", label: "Amarillo oscuro", value: "#ca8a04" },
            { name: "lime-400", label: "Lima claro", value: "#a3e635" },
            { name: "lime-500", label: "Lima", value: "#84cc16" },
            { name: "lime-600", label: "Lima oscuro", value: "#65a30d" },
        ],
    },
    {
        group: "Verdes",
        colors: [
            { name: "green-400", label: "Verde claro", value: "#4ade80" },
            { name: "green-500", label: "Verde", value: "#22c55e" },
            { name: "green-600", label: "Verde oscuro", value: "#16a34a" },
            { name: "emerald-400", label: "Esmeralda claro", value: "#34d399" },
            { name: "emerald-500", label: "Esmeralda", value: "#10b981" },
            {
                name: "emerald-600",
                label: "Esmeralda oscuro",
                value: "#059669",
            },
        ],
    },
    {
        group: "Azules",
        colors: [
            { name: "cyan-400", label: "Cyan claro", value: "#22d3ee" },
            { name: "cyan-500", label: "Cyan", value: "#06b6d4" },
            { name: "cyan-600", label: "Cyan oscuro", value: "#0891b2" },
            { name: "sky-400", label: "Cielo claro", value: "#38bdf8" },
            { name: "sky-500", label: "Cielo", value: "#0ea5e9" },
            { name: "sky-600", label: "Cielo oscuro", value: "#0284c7" },
            { name: "blue-400", label: "Azul claro", value: "#60a5fa" },
            { name: "blue-500", label: "Azul", value: "#3b82f6" },
            { name: "blue-600", label: "Azul oscuro", value: "#2563eb" },
        ],
    },
    {
        group: "Morados",
        colors: [
            { name: "indigo-400", label: "Índigo claro", value: "#818cf8" },
            { name: "indigo-500", label: "Índigo", value: "#6366f1" },
            { name: "indigo-600", label: "Índigo oscuro", value: "#4f46e5" },
            { name: "violet-400", label: "Violeta claro", value: "#a78bfa" },
            { name: "violet-500", label: "Violeta", value: "#8b5cf6" },
            { name: "violet-600", label: "Violeta oscuro", value: "#7c3aed" },
            { name: "purple-400", label: "Púrpura claro", value: "#c084fc" },
            { name: "purple-500", label: "Púrpura", value: "#a855f7" },
            { name: "purple-600", label: "Púrpura oscuro", value: "#9333ea" },
        ],
    },
    {
        group: "Rosas",
        colors: [
            { name: "pink-400", label: "Rosa claro", value: "#f472b6" },
            { name: "pink-500", label: "Rosa", value: "#ec4899" },
            { name: "pink-600", label: "Rosa oscuro", value: "#db2777" },
            { name: "fuchsia-400", label: "Fucsia claro", value: "#e879f9" },
            { name: "fuchsia-500", label: "Fucsia", value: "#d946ef" },
            { name: "fuchsia-600", label: "Fucsia oscuro", value: "#c026d3" },
        ],
    },
    {
        group: "Neutros",
        colors: [
            { name: "slate-400", label: "Pizarra claro", value: "#94a3b8" },
            { name: "slate-500", label: "Pizarra", value: "#64748b" },
            { name: "zinc-400", label: "Zinc claro", value: "#a1a1aa" },
            { name: "zinc-500", label: "Zinc", value: "#71717a" },
            { name: "stone-400", label: "Piedra claro", value: "#a8a29e" },
            { name: "stone-500", label: "Piedra", value: "#78716c" },
        ],
    },
];

// Lista plana — útil para buscar por name o value
export const ALL_CATEGORY_COLORS: ColorOption[] = CATEGORY_COLOR_GROUPS.flatMap(
    (g) => g.colors,
);

// Helper: devuelve el value
export function getColorvalue(name: string): string {
    return ALL_CATEGORY_COLORS.find((c) => c.name === name)?.value ?? "#6366f1";
}
