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
import { useCategories } from "@/hooks/useCategories";
import { type TransactionFormData, transactionSchema } from "@/lib/schemas";
import type { Transaction } from "@/types";

interface TransactionFormProps {
    onSubmit: (data: TransactionFormData) => void;
    onCancel: () => void;
    isPending: boolean;
    defaultValues?: Transaction;
}

export function TransactionForm({
    onSubmit,
    onCancel,
    isPending,
    defaultValues,
}: TransactionFormProps) {
    const { data: categories = [] } = useCategories();

    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: defaultValues
            ? {
                  category_id: defaultValues.category_id,
                  amount: defaultValues.amount,
                  type: defaultValues.type,
                  description: defaultValues.description ?? "",
                  date: defaultValues.date.slice(0, 10),
              }
            : {
                  type: "expense",
                  description: "",
                  date: new Date().toISOString().slice(0, 10),
                  category_id: null,
              },
    });

    const selectedType = watch("type");
    const filteredCategories = categories.filter(
        (c) => c.type === selectedType,
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                <SelectValue />
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
            </div>

            {/* Monto */}
            <div className="space-y-2">
                <Label className="text-zinc-300">Monto (USD)</Label>
                <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    {...register("amount", { valueAsNumber: true })}
                />
                {errors.amount && (
                    <p className="text-red-400 text-xs">
                        {errors.amount.message}
                    </p>
                )}
            </div>

            {/* Categoría */}
            <div className="space-y-2">
                <Label className="text-zinc-300">Categoría</Label>
                <Controller
                    control={control}
                    name="category_id"
                    render={({ field }) => (
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ?? undefined}
                        >
                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectValue placeholder="Sin categoría" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                                {filteredCategories.length === 0 ? (
                                    <SelectItem
                                        value="none"
                                        disabled
                                        className="text-zinc-500"
                                    >
                                        No hay categorías de este tipo
                                    </SelectItem>
                                ) : (
                                    filteredCategories.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={c.id}
                                            className="text-white focus:bg-zinc-700"
                                        >
                                            {c.icon} {c.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
                <Label className="text-zinc-300">Descripción</Label>
                <Input
                    placeholder="Descripción opcional"
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    {...register("description")}
                />
            </div>

            {/* Fecha */}
            <div className="space-y-2">
                <Label className="text-zinc-300">Fecha</Label>
                <Input
                    type="date"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    {...register("date")}
                />
                {errors.date && (
                    <p className="text-red-400 text-xs">
                        {errors.date.message}
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
                    {isPending
                        ? "Guardando..."
                        : defaultValues
                          ? "Guardar cambios"
                          : "Crear"}
                </Button>
            </div>
        </form>
    );
}
