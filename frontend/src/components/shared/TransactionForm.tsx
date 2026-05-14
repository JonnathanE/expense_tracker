import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { type TransactionFormData, transactionSchema } from "@/lib/schemas";
import type { Category, Transaction } from "@/types";

interface TransactionFormProps {
    onSubmit: (data: TransactionFormData) => void;
    onCancel: () => void;
    isPending: boolean;
    defaultValues?: Transaction;
}

function CategorySelect({
    categories,
    value,
    onChange,
}: {
    categories: Category[];
    value: string | null;
    onChange: (id: string | null) => void;
}) {
    const [open, setOpen] = useState(false);
    const selected = categories.find((c) => c.id === value) ?? null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal"
                >
                    {selected ? (
                        <span className="flex items-center gap-2">
                            <CategoryIcon
                                icon={selected.icon}
                                color={selected.color}
                                size="sm"
                            />
                            {selected.name}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">
                            Sin categoría
                        </span>
                    )}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar categoría..." />
                    <CommandList>
                        <CommandEmpty>Sin resultados.</CommandEmpty>
                        <CommandGroup>
                            {categories.map((c) => (
                                <CommandItem
                                    key={c.id}
                                    value={c.name}
                                    onSelect={() => {
                                        onChange(c.id === value ? null : c.id);
                                        setOpen(false);
                                    }}
                                >
                                    <span className="flex items-center gap-2 flex-1">
                                        <CategoryIcon
                                            icon={c.icon}
                                            color={c.color}
                                            size="sm"
                                        />
                                        {c.name}
                                    </span>
                                    {value === c.id && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
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
                                <SelectValue />
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
            </div>

            {/* Monto */}
            <div className="space-y-2">
                <Label>Monto (USD)</Label>
                <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    {...register("amount", { valueAsNumber: true })}
                />
                {errors.amount && (
                    <p className="text-destructive text-xs">
                        {errors.amount.message}
                    </p>
                )}
            </div>

            {/* Categoría */}
            <div className="space-y-2">
                <Label>Categoría</Label>
                <Controller
                    control={control}
                    name="category_id"
                    render={({ field }) => (
                        <CategorySelect
                            categories={filteredCategories}
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                    placeholder="Descripción opcional"
                    {...register("description")}
                />
            </div>

            {/* Fecha */}
            <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" {...register("date")} />
                {errors.date && (
                    <p className="text-destructive text-xs">
                        {errors.date.message}
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
                          : "Crear"}
                </Button>
            </div>
        </form>
    );
}
