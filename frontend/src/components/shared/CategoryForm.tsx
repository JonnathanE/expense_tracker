import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CategoryColorPicker } from "@/components/shared/CategoryColorPicker";
import { CategoryIconPicker } from "@/components/shared/CategoryIconPicker";
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
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: defaultValues ?? {
            icon: "wallet",
            color: "#6366f1",
            type: "expense",
        },
    });

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
                            <SelectTrigger className="w-full">
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
                <Controller
                    control={control}
                    name="icon"
                    render={({ field }) => (
                        <CategoryIconPicker
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                {errors.icon && (
                    <p className="text-destructive text-xs">
                        {errors.icon.message}
                    </p>
                )}
            </div>

            {/* Color */}
            <div className="space-y-2">
                <Label>Color</Label>
                <Controller
                    control={control}
                    name="color"
                    render={({ field }) => (
                        <CategoryColorPicker
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
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
