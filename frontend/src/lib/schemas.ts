import type { TFunction } from "i18next";
import { z } from "zod";

// ── Factory ──────────────────────────────────────────────────────────────────
// Los schemas de Zod son estáticos, por eso los envolvemos en una función que
// recibe `t` del hook useTranslation para que los mensajes sean reactivos al
// cambio de idioma.

export function createSchemas(t: TFunction) {
    const loginSchema = z.object({
        email: z
            .string()
            .min(1, t("schema.emailRequired"))
            .email(t("schema.emailInvalid")),
        password: z.string().min(1, t("schema.passwordRequired")),
    });

    const registerSchema = z
        .object({
            name: z
                .string()
                .min(1, t("schema.nameRequired"))
                .min(2, t("schema.nameMinLength")),
            email: z
                .string()
                .min(1, t("schema.emailRequired"))
                .email(t("schema.emailInvalid")),
            password: z.string().min(6, t("schema.passwordMinLength")),
            confirmPassword: z.string().min(1, t("schema.confirmPassword")),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: t("schema.passwordsNoMatch"),
            path: ["confirmPassword"],
        });

    const categorySchema = z.object({
        name: z.string().min(1, t("schema.nameRequired")),
        type: z.enum(["income", "expense"], {
            required_error: t("schema.typeRequired"),
        }),
        icon: z.string().min(1, t("schema.iconRequired")),
        color: z.string().min(1, t("schema.colorRequired")),
    });

    const transactionSchema = z.object({
        account_id: z.string().nullable(),
        category_id: z.string().nullable(),
        amount: z
            .number({ invalid_type_error: t("schema.amountInvalid") })
            .positive(t("schema.amountPositive")),
        type: z.enum(["income", "expense"]),
        description: z.string(),
        date: z.string().min(1, t("schema.dateRequired")),
    });

    const forgotPasswordSchema = z.object({
        email: z
            .string()
            .min(1, t("schema.emailRequired"))
            .email(t("schema.emailInvalid")),
    });

    const resetPasswordSchema = z
        .object({
            password: z.string().min(6, t("schema.passwordMinLength")),
            confirmPassword: z.string().min(1, t("schema.confirmPassword")),
        })
        .refine((d) => d.password === d.confirmPassword, {
            message: t("schema.passwordsNoMatch"),
            path: ["confirmPassword"],
        });

    const accountSchema = z.object({
        name: z.string().min(1, t("schema.nameRequired")),
        icon: z.string().min(1, t("schema.iconRequired")),
        color: z.string().min(1, t("schema.colorRequired")),
        balance: z
            .number({ invalid_type_error: t("schema.amountInvalid") })
            .min(0, t("schema.balanceMin")),
        currency: z.string().min(1, t("schema.currencyRequired")),
        exclude_from_stats: z.boolean(),
    });

    const transferSchema = z.object({
        from_account_id: z.string().min(1, t("schema.accountRequired")),
        to_account_id: z.string().min(1, t("schema.accountRequired")),
        amount: z
            .number({ invalid_type_error: t("schema.amountInvalid") })
            .positive(t("schema.amountPositive")),
        fee: z
            .number({ invalid_type_error: t("schema.amountInvalid") })
            .min(0, t("schema.feeMin")),
        description: z.string(),
        date: z.string().min(1, t("schema.dateRequired")),
    });

    return {
        loginSchema,
        registerSchema,
        categorySchema,
        transactionSchema,
        accountSchema,
        transferSchema,
        forgotPasswordSchema,
        resetPasswordSchema,
    };
}

// ── Tipos inferidos (no dependen de `t`) ─────────────────────────────────────
// Los inferimos de schemas temporales con strings vacíos para obtener los tipos.

const _base = createSchemas(((k: string) => k) as TFunction);

export type LoginFormData = z.infer<typeof _base.loginSchema>;
export type RegisterFormData = z.infer<typeof _base.registerSchema>;
export type CategoryFormData = z.infer<typeof _base.categorySchema>;
export type TransactionFormData = z.infer<typeof _base.transactionSchema>;
export type AccountFormData = z.infer<typeof _base.accountSchema>;
export type TransferFormData = z.infer<typeof _base.transferSchema>;
export type ForgotPasswordFormData = z.infer<typeof _base.forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof _base.resetPasswordSchema>;
