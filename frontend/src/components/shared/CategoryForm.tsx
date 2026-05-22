import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
import { type CategoryFormData, createSchemas } from "@/lib/schemas";

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
    const { t } = useTranslation();
    const { categorySchema } = createSchemas(t);

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
                <Label>{t("categoryForm.name")}</Label>
                <Input
                    placeholder={t("categoryForm.namePlaceholder")}
                    {...register("name")}
                />
                {errors.name && (
                    <p className="text-destructive text-xs">
                        {errors.name.message}
                    </p>
                )}
            </div>

            {/* Tipo */}
            <div className="space-y-2">
                <Label>{t("categoryForm.type")}</Label>
                <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder={t("categoryForm.selectType")}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expense">
                                    {t("categoryForm.expense")}
                                </SelectItem>
                                <SelectItem value="income">
                                    {t("categoryForm.income")}
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
                <Label>{t("categoryForm.icon")}</Label>
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
                <Label>{t("categoryForm.color")}</Label>
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
                    {t("categoryForm.cancel")}
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending
                        ? t("categoryForm.saving")
                        : defaultValues
                          ? t("categoryForm.saveChanges")
                          : t("categoryForm.create")}
                </Button>
            </div>
        </form>
    );
}
