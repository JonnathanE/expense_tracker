import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "El email es requerido")
        .email("Ingresa un email válido"),
    password: z.string().min(1, "La contraseña es requerida"),
});

export const registerSchema = z
    .object({
        name: z
            .string()
            .min(1, "El nombre es requerido")
            .min(2, "El nombre debe tener al menos 2 caracteres"),
        email: z
            .string()
            .min(1, "El email es requerido")
            .email("Ingresa un email válido"),
        password: z
            .string()
            .min(6, "La contraseña debe tener al menos 6 caracteres"),
        confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

export const categorySchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    type: z.enum(["income", "expense"], {
        required_error: "Selecciona un tipo",
    }),
    icon: z.string().min(1, "Selecciona un ícono"),
    color: z.string().min(1, "Selecciona un color"),
});

export const transactionSchema = z.object({
    category_id: z.string().nullable(),
    amount: z
        .number({ invalid_type_error: "Ingresa un monto válido" })
        .positive("El monto debe ser mayor a 0"),
    type: z.enum(["income", "expense"]),
    description: z.string(),
    date: z.string().min(1, "La fecha es requerida"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().min(1, "El email es requerido").email("Email inválido"),
});

export const resetPasswordSchema = z
    .object({
        password: z.string().min(6, "Mínimo 6 caracteres"),
        confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
