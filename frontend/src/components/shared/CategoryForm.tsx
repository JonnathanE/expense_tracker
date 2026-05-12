import { zodResolver } from "@hookform/resolvers/zod";
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
const COLORS = [
    { label: "Índigo", value: "#6366f1" },
    { label: "Esmeralda", value: "#10b981" },
    { label: "Rojo", value: "#ef4444" },
    { label: "Ámbar", value: "#f59e0b" },
    { label: "Cyan", value: "#06b6d4" },
    { label: "Rosa", value: "#ec4899" },
    { label: "Violeta", value: "#8b5cf6" },
    { label: "Lima", value: "#84cc16" },
];

interface CategoryFormProps {
    onSubmit: (data: CategoryFormData) => void;
    onCancel: () => void;
    isPending: boolean;
}

export function CategoryForm({
    onSubmit,
    onCancel,
    isPending,
}: CategoryFormProps) {
    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: { icon: "💰", color: "#6366f1", type: "expense" },
    });

    const selectedIcon = watch("icon");
    const selectedColor = watch("color");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nombre */}
            <div className="space-y-2">
                <Label className="text-zinc-300">Nombre</Label>
                <Input
                    placeholder="Ej: Alimentación"
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    {...register("name")}
                />
                {errors.name && (
                    <p className="text-red-400 text-xs">
                        {errors.name.message}
                    </p>
                )}
            </div>

            {/* Tipo */}
            <div className="space-y-2">
                <Label className="text-zinc-300">Tipo</Label>
                <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                                <SelectItem
                                    value="expense"
                                    className="text-white focus:bg-zinc-700"
                                >
                                    💸 Gasto
                                </SelectItem>
                                <SelectItem
                                    value="income"
                                    className="text-white focus:bg-zinc-700"
                                >
                                    💵 Ingreso
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.type && (
                    <p className="text-red-400 text-xs">
                        {errors.type.message}
                    </p>
                )}
            </div>

            {/* Ícono */}
            <div className="space-y-2">
                <Label className="text-zinc-300">Ícono</Label>
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
                        ? "border-indigo-500 bg-indigo-950"
                        : "border-zinc-700 bg-zinc-800 hover:border-zinc-500"
                }
              `}
                            >
                                {icon}
                            </span>
                        </label>
                    ))}
                </div>
                {errors.icon && (
                    <p className="text-red-400 text-xs">
                        {errors.icon.message}
                    </p>
                )}
            </div>

            {/* Color */}
            <div className="space-y-2">
                <Label className="text-zinc-300">Color</Label>
                <div className="flex gap-2 flex-wrap">
                    {COLORS.map(({ value }) => (
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
                ${selectedColor === value ? "border-white scale-110" : "border-transparent"}
              `}
                                style={{ backgroundColor: value }}
                            />
                        </label>
                    ))}
                </div>
                {errors.color && (
                    <p className="text-red-400 text-xs">
                        {errors.color.message}
                    </p>
                )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-2">
                <Button
                    type="button"
                    variant="ghost"
                    className="text-zinc-400 hover:text-zinc-200"
                    onClick={onCancel}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500"
                    disabled={isPending}
                >
                    {isPending ? "Creando..." : "Crear categoría"}
                </Button>
            </div>
        </form>
    );
}
