import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
import { createSchemas, type TransferFormData } from "@/lib/schemas";
import type { Account } from "@/types";

interface TransferFormProps {
    accounts: Account[];
    onSubmit: (data: TransferFormData) => void;
    onCancel: () => void;
    isPending: boolean;
}

export function TransferForm({
    accounts,
    onSubmit,
    onCancel,
    isPending,
}: TransferFormProps) {
    const { t } = useTranslation();
    const { transferSchema } = createSchemas(t);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<TransferFormData>({
        resolver: zodResolver(transferSchema),
        defaultValues: {
            fee: 0,
            description: "",
            date: new Date().toLocaleDateString("en-CA"),
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Cuenta origen */}
            <div className="space-y-2">
                <Label>{t("transferForm.fromAccount")}</Label>
                <Controller
                    control={control}
                    name="from_account_id"
                    render={({ field }) => (
                        <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder={t(
                                        "transferForm.selectAccount",
                                    )}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.from_account_id && (
                    <p className="text-destructive text-xs">
                        {errors.from_account_id.message}
                    </p>
                )}
            </div>

            {/* Cuenta destino */}
            <div className="space-y-2">
                <Label>{t("transferForm.toAccount")}</Label>
                <Controller
                    control={control}
                    name="to_account_id"
                    render={({ field }) => (
                        <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder={t(
                                        "transferForm.selectAccount",
                                    )}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.to_account_id && (
                    <p className="text-destructive text-xs">
                        {errors.to_account_id.message}
                    </p>
                )}
            </div>

            {/* Monto */}
            <div className="space-y-2">
                <Label>{t("transferForm.amount")}</Label>
                <Controller
                    control={control}
                    name="amount"
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
                {errors.amount && (
                    <p className="text-destructive text-xs">
                        {errors.amount.message}
                    </p>
                )}
            </div>

            {/* Comisión */}
            <div className="space-y-2">
                <Label>
                    {t("transferForm.fee")}{" "}
                    <span className="text-muted-foreground text-xs">
                        ({t("common.optional")})
                    </span>
                </Label>
                <Controller
                    control={control}
                    name="fee"
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
            </div>

            {/* Descripción */}
            <div className="space-y-2">
                <Label>
                    {t("transferForm.description")}{" "}
                    <span className="text-muted-foreground text-xs">
                        ({t("common.optional")})
                    </span>
                </Label>
                <Input
                    placeholder={t("transferForm.descriptionPlaceholder")}
                    {...register("description")}
                />
            </div>

            {/* Fecha */}
            <div className="space-y-2">
                <Label>{t("transferForm.date")}</Label>
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
                    {t("transferForm.cancel")}
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending
                        ? t("transferForm.saving")
                        : t("transferForm.create")}
                </Button>
            </div>
        </form>
    );
}
