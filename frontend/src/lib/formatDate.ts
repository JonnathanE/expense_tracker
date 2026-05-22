import i18n from "@/i18n";

export function formatDate(
    date: Date,
    options?: Intl.DateTimeFormatOptions,
): string {
    const locale = i18n.language === "en" ? "en-US" : "es-EC";
    return date.toLocaleDateString(locale, options);
}

export function formatCurrency(amount: number): string {
    const locale = i18n.language === "en" ? "en-US" : "es-EC";
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
    }).format(amount);
}
