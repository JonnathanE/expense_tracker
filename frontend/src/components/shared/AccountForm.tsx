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
import { Switch } from "@/components/ui/switch";
import { CURRENCIES, getCurrency } from "@/lib/currencies";
import { type AccountFormData, createSchemas } from "@/lib/schemas";

interface AccountFormProps {
    onSubmit: (data: AccountFormData) => void;
    onCancel: () => void;
    isPending: boolean;
    defaultValues?: AccountFormData;
    /** Cuando se edita, pasar la moneda actual para mostrarla como solo lectura */
    existingCurrency?: string;
}

export function AccountForm({
    onSubmit,
    onCancel,
    isPending,
    defaultValues,
    existingCurrency,
}: AccountFormProps) {
    const { t } = useTranslation();
    const { accountSchema } = createSchemas(t);
    const isEditing = !!defaultValues;

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema),
        defaultValues: defaultValues ?? {
            icon: "wallet",
            color: "#6366f1",
            balance: 0,
            currency: "USD",
            exclude_from_stats: false,
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nombre */}
            <div className="space-y-2">
                <Label>{t("accountForm.name")}</Label>
                <Input
                    placeholder={t("accountForm.namePlaceholder")}
                    {...register("name")}
                />
                {errors.name && (
                    <p className="text-destructive text-xs">
                        {errors.name.message}
                    </p>
                )}
            </div>

            {/* Balance */}
            <div className="space-y-2">
                <Label>
                    {isEditing
                        ? t("accountForm.balanceEdit")
                        : t("accountForm.balance")}
                </Label>
                <Controller
                    control={control}
                    name="balance"
                    render={({ field }) => (
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={field.value ?? ""}
                            onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                            }
                        />
                    )}
                />
                {errors.balance && (
                    <p className="text-destructive text-xs">
                        {errors.balance.message}
                    </p>
                )}
            </div>

            {/* Moneda — solo lectura al editar, selector al crear */}
            <div className="space-y-2">
                <Label>{t("accountForm.currency")}</Label>
                {isEditing ? (
                    <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/50">
                        <span className="text-sm text-foreground">
                            {(() => {
                                const c = getCurrency(
                                    existingCurrency ?? "USD",
                                );
                                return c
                                    ? `${c.symbol} ${c.code} — ${c.name}`
                                    : existingCurrency;
                            })()}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                            {t("accountForm.currencyLocked")}
                        </span>
                    </div>
                ) : (
                    <Controller
                        control={control}
                        name="currency"
                        render={({ field }) => (
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="USD" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CURRENCIES.map((c) => (
                                        <SelectItem key={c.code} value={c.code}>
                                            {c.symbol} {c.code} — {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                )}
            </div>

            {/* Ícono */}
            <div className="space-y-2">
                <Label>{t("accountForm.icon")}</Label>
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
                <Label>{t("accountForm.color")}</Label>
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

            {/* Excluir de estadísticas */}
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                    <p className="text-sm font-medium">
                        {t("accountForm.excludeFromStats")}
                    </p>
                    <p className="text-muted-foreground text-xs">
                        {t("accountForm.excludeFromStatsHint")}
                    </p>
                </div>
                <Controller
                    control={control}
                    name="exclude_from_stats"
                    render={({ field }) => (
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    )}
                />
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    {t("accountForm.cancel")}
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending
                        ? t("accountForm.saving")
                        : defaultValues
                          ? t("accountForm.saveChanges")
                          : t("accountForm.create")}
                </Button>
            </div>
        </form>
    );
}
