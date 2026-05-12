import { zodResolver } from "@hookform/resolvers/zod";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { type CategoryFormData, categorySchema } from "@/lib/schemas";

const ICONS = [
    "💰",
    "🍔",
    "🚌",
    "🏠",
    "💊",
    "🎮",
    "📚",
    "✈️",
    "👕",
    "💼",
    "📱",
    "🎵",
    "🐶",
    "⚽",
    "🧾",
    "🛒",
];

const COLORS_PRIMARY = [
    { label: "Índigo", value: "#6366f1" },
    { label: "Esmeralda", value: "#10b981" },
    { label: "Rojo", value: "#ef4444" },
    { label: "Ámbar", value: "#f59e0b" },
    { label: "Cyan", value: "#06b6d4" },
    { label: "Rosa", value: "#ec4899" },
    { label: "Violeta", value: "#8b5cf6" },
    { label: "Lima", value: "#84cc16" },
];

const COLORS_EXTENDED = [
    { label: "Naranja", value: "#f97316" },
    { label: "Amarillo", value: "#eab308" },
    { label: "Verde", value: "#22c55e" },
    { label: "Teal", value: "#14b8a6" },
    { label: "Azul cielo", value: "#38bdf8" },
    { label: "Azul", value: "#3b82f6" },
    { label: "Índigo oscuro", value: "#4338ca" },
    { label: "Púrpura", value: "#a855f7" },
    { label: "Fucsia", value: "#d946ef" },
    { label: "Rojo oscuro", value: "#dc2626" },
    { label: "Rosa claro", value: "#f472b6" },
    { label: "Coral", value: "#fb7185" },
    { label: "Marrón", value: "#a16207" },
    { label: "Gris", value: "#6b7280" },
    { label: "Pizarra", value: "#475569" },
    { label: "Zinc", value: "#71717a" },
];

interface CategoryFormProps {
    onSubmit: (data: CategoryFormData) => void;
    onCancel: () => void;
    isPending: boolean;
    defaultValues?: CategoryFormData;
}

export function CategoryForm({
    onSubmit,
    onCancel,
    isPending,
    defaultValues,
}: CategoryFormProps) {
    const [showMoreColors, setShowMoreColors] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: defaultValues ?? {
            icon: "💰",
            color: "#6366f1",
            type: "expense",
        },
    });

    const selectedIcon = watch("icon");
    const selectedColor = watch("color");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nombre */}
            <div className="space-y-2">
                <Label>Nombre</Label>
                <Input placeholder="Ej: Alimentación" {...register("name")} />
                {errors.name && (
                    <p className="text-destructive text-xs">
                        {errors.name.message}
                    </p>
                )}
            </div>

            {/* Tipo */}
            <div className="space-y-2">
                <Label>Tipo</Label>
                <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expense">
                                    💸 Gasto
                                </SelectItem>
                                <SelectItem value="income">
                                    💵 Ingreso
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.type && (
                    <p className="text-destructive text-xs">
                        {errors.type.message}
                    </p>
                )}
            </div>

            {/* Ícono */}
            <div className="space-y-2">
                <Label>Ícono</Label>
                <div className="flex flex-wrap gap-2">
                    {ICONS.map((icon) => (
                        <label key={icon} className="cursor-pointer">
                            <input
                                type="radio"
                                value={icon}
                                className="sr-only"
                                {...register("icon")}
                            />
                            <span
                                className={`
                  flex items-center justify-center w-10 h-10 rounded-lg text-xl
                  border-2 transition-all
                  ${
                      selectedIcon === icon
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted hover:border-muted-foreground/50"
}
                `}
                            >
                                {icon}
                            </span>
                        </label>
                    ))}
                </div>
                {errors.icon && (
                    <p className="text-destructive text-xs">
                        {errors.icon.message}
                    </p>
                )}
            </div>

            {/* Color */}
            <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap items-center">
                    {COLORS_PRIMARY.map(({ value }) => (
                        <label key={value} className="cursor-pointer">
                            <input
                                type="radio"
                                value={value}
                                className="sr-only"
                                {...register("color")}
                            />
                            <span
                                className={`
                  flex items-center justify-center w-8 h-8 rounded-full
                  border-2 transition-all
                  ${selectedColor === value ? "border-foreground scale-110" : "border-transparent"}
                `}
                                style={{ backgroundColor: value }}
                            />
                        </label>
                    ))}
                    <button
                        type="button"
                        onClick={() => setShowMoreColors((v) => !v)}
                        className="w-8 h-8 rounded-full border-2 border-border bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-all"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>

                {showMoreColors && (
                    <div className="flex gap-2 flex-wrap pt-1">
                        {COLORS_EXTENDED.map(({ value }) => (
                            <label key={value} className="cursor-pointer">
                                <input
                                    type="radio"
                                    value={value}
                                    className="sr-only"
                                    {...register("color")}
                                />
                                <span
                                    className={`
                      flex items-center justify-center w-8 h-8 rounded-full
                      border-2 transition-all
                      ${selectedColor === value ? "border-foreground scale-110" : "border-transparent"}
                    `}
                                    style={{ backgroundColor: value }}
                                />
                            </label>
                        ))}
                    </div>
                )}

                {errors.color && (
                    <p className="text-destructive text-xs">
                        {errors.color.message}
                    </p>
                )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending
                        ? "Guardando..."
                        : defaultValues
                          ? "Guardar cambios"
                          : "Crear categoría"}
                </Button>
            </div>
        </form>
    );
}
