import axios from "axios";
import { toast } from "sonner";
import i18n from "@/i18n";

/**
 * Contextos de operación para fallback de mensajes.
 * Si el código del backend no tiene traducción, se usa el mensaje de fallback del contexto.
 */
export type ApiErrorContext =
    | "fetch"
    | "create"
    | "update"
    | "delete"
    | "auth"
    | "generic";

/**
 * Extrae el código de error del backend desde un error de axios.
 * El backend responde siempre con { "error": "code_identifier" }.
 */
export function getApiErrorCode(error: unknown): string | null {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.error ?? null;
    }
    return null;
}

/**
 * Resuelve el mensaje i18n para un código de error.
 * Busca primero en "apiErrors.<code>", si no existe devuelve null.
 */
export function resolveErrorMessage(code: string): string | null {
    const key = `apiErrors.${code}`;
    const translated = i18n.t(key);
    // i18next devuelve la clave si no hay traducción
    return translated !== key ? translated : null;
}

/**
 * Mensaje de fallback según el contexto de la operación.
 */
export function fallbackMessage(context: ApiErrorContext): string {
    return i18n.t(`apiErrors._fallback.${context}`);
}

/**
 * Devuelve el mensaje de error como string (para mostrar inline en UI).
 * Misma lógica que handleApiError pero sin toast.
 */
export function getApiErrorMessage(
    error: unknown,
    context: ApiErrorContext = "generic",
): string {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const code = getApiErrorCode(error);

        if (!status || status >= 500) {
            return i18n.t("apiErrors.server_error");
        }

        if (code) {
            const msg = resolveErrorMessage(code);
            if (msg) return msg;
        }

        return fallbackMessage(context);
    }

    return fallbackMessage("generic");
}

/**
 * Muestra un toast.error con el mensaje apropiado.
 *
 * Orden de resolución:
 * 1. Si hay código de error del backend → buscar en apiErrors.<code>
 * 2. Si no hay traducción para ese código → usar fallback del contexto
 * 3. Si es un error 500 o sin respuesta → usar fallback "generic" o "server_error"
 */
export function handleApiError(
    error: unknown,
    context: ApiErrorContext = "generic",
): void {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const code = getApiErrorCode(error);

        // Errores de servidor (5xx) o sin respuesta → siempre mensaje genérico
        if (!status || status >= 500) {
            toast.error(i18n.t("apiErrors.server_error"));
            return;
        }

        if (code) {
            const msg = resolveErrorMessage(code);
            if (msg) {
                toast.error(msg);
                return;
            }
        }

        // Código no reconocido → fallback por contexto
        toast.error(fallbackMessage(context));
        return;
    }

    // Error inesperado no-axios
    toast.error(fallbackMessage("generic"));
}
